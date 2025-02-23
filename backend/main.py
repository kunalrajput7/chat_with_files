from fastapi import FastAPI, UploadFile, File
from pdf_processor import extract_text_from_pdf
from rag import RAGSystem
import os

app = FastAPI()
rag = RAGSystem()

@app.post("/upload_pdf")
async def upload_pdf(file: UploadFile = File(...)):
    pdf_path = f"temp_{file.filename}"
    with open(pdf_path, "wb") as f:
        f.write(await file.read())
    sentences = extract_text_from_pdf(pdf_path)
    rag.build_index(sentences)
    os.remove(pdf_path)
    return {"message": "PDF processed successfully"}

@app.get("/query")
async def query(query: str):
    context = ". ".join(rag.retrieve(query))
    answer = rag.generate_answer(query, context)
    return {"answer": answer}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)