from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from transformers import AutoModelForCausalLM, AutoTokenizer, BitsAndBytesConfig
from sentence_transformers import SentenceTransformer
import faiss
import PyPDF2
import numpy as np
import torch
import os
import requests
import io

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Model configuration
MODEL_NAME = os.getenv("MODEL_NAME", "TinyLlama/TinyLlama-1.1B-Chat-v1.0")
USE_QUANTIZATION = torch.cuda.is_available() and torch.cuda.get_device_properties(0).total_memory < 6e9

# Load models
print(f"Initializing model: {MODEL_NAME}")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)

quant_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_use_double_quant=True,
    bnb_4bit_quant_type="nf4",
    bnb_4bit_compute_dtype=torch.float16
) if USE_QUANTIZATION else None

model_kwargs = {
    "pretrained_model_name_or_path": MODEL_NAME,
    "device_map": "auto",
    "torch_dtype": torch.float16,
    "low_cpu_mem_usage": True
}
if quant_config:
    model_kwargs["quantization_config"] = quant_config
if MODEL_NAME == "microsoft/phi-2":
    model_kwargs["trust_remote_code"] = True

model = AutoModelForCausalLM.from_pretrained(**model_kwargs)
print(f"Model {MODEL_NAME} loaded successfully.")

# Embedding model
embedder = SentenceTransformer('all-MiniLM-L6-v2')

# Global state
index = None
pdf_chunks = []

def extract_text_from_pdf(file):
    try:
        reader = PyPDF2.PdfReader(file)
        text = ""
        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"
        return text
    except Exception as e:
        raise RuntimeError(f"PDF extraction failed: {str(e)}")

def process_text(text):
    global index, pdf_chunks
    # Reset previous state
    index = None
    pdf_chunks = []
    
    # Process new text
    words = text.split()
    pdf_chunks = [' '.join(words[i:i+200]) for i in range(0, len(words), 200)]
    
    if not pdf_chunks:
        raise ValueError("No text extracted from PDF")
    
    # Create embeddings
    embeddings = embedder.encode(pdf_chunks, convert_to_numpy=True)
    dimension = embeddings.shape[1]
    
    # Create FAISS index
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings)
    print(f"Processed {len(pdf_chunks)} chunks into FAISS index.")

async def process_pdf_content(content: bytes):
    try:
        file_like = io.BytesIO(content)
        text = extract_text_from_pdf(file_like)
        process_text(text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    try:
        content = await file.read()
        await process_pdf_content(content)
        return {"message": "PDF processed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/load_pdf")
async def load_pdf(pdf_data: dict):
    try:
        download_url = pdf_data.get("download_url")
        if not download_url:
            raise HTTPException(status_code=400, detail="Missing download URL")
        
        # Download PDF
        response = requests.get(download_url)
        response.raise_for_status()
        
        await process_pdf_content(response.content)
        return {"message": "PDF loaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/query")
async def query_pdf(query: str):
    try:
        if index is None or not pdf_chunks:
            raise HTTPException(status_code=400, detail="Please load a PDF first")
        
        # Generate response
        query_embedding = embedder.encode([query])
        D, I = index.search(query_embedding, k=3)
        relevant_chunks = [pdf_chunks[i] for i in I[0]]
        context = "\n".join(relevant_chunks)

        prompt = f"Context:\n{context}\n\nQuestion: {query}\nAnswer:"
        inputs = tokenizer(prompt, return_tensors="pt").to("cuda" if torch.cuda.is_available() else "cpu")
        
        outputs = model.generate(
            **inputs,
            max_new_tokens=100,
            do_sample=True,
            temperature=0.7,
            top_p=0.9
        )
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        if response.startswith(prompt):
            response = response[len(prompt):].strip()
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)