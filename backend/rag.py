from sentence_transformers import SentenceTransformer
import faiss
import numpy as np
from transformers import AutoTokenizer, AutoModelForCausalLM

class RAGSystem:
    def __init__(self):
        """
        Initialize the RAG system with embedding model and Mixtral-7B-Instruct-v0.3 LLM.
        """
        # Load embedding model for retrieval
        self.embedder = SentenceTransformer('all-MiniLM-L6-v2')
        # Load tokenizer and model for generation (updated to v0.3)
        self.tokenizer = AutoTokenizer.from_pretrained("mistralai/Mixtral-7B-Instruct-v0.3")
        self.model = AutoModelForCausalLM.from_pretrained("mistralai/Mixtral-7B-Instruct-v0.3")
        self.index = None  # FAISS index for vector search
        self.sentences = []  # Store original sentences

    def build_index(self, sentences):
        """
        Build a FAISS index from a list of sentences.
        
        Args:
            sentences (list): List of sentences from the PDF.
        """
        self.sentences = sentences
        # Convert sentences to embeddings
        embeddings = self.embedder.encode(sentences, show_progress_bar=True)
        # Create FAISS index
        dimension = embeddings.shape[1]
        self.index = faiss.IndexFlatL2(dimension)
        self.index.add(np.array(embeddings))

    def retrieve(self, query, k=3):
        """
        Retrieve top-k relevant sentences for a query.
        
        Args:
            query (str): User's question.
            k (int): Number of sentences to retrieve.
        Returns:
            list: Top-k relevant sentences.
        """
        if not self.index:
            return ["No PDF processed yet."]
        # Embed the query
        query_embedding = self.embedder.encode([query])
        # Search FAISS index
        distances, indices = self.index.search(np.array(query_embedding), k)
        return [self.sentences[i] for i in indices[0]]

    def generate_answer(self, query, context):
        """
        Generate an answer using the LLM based on retrieved context.
        
        Args:
            query (str): User's question.
            context (str): Retrieved sentences as context.
        Returns:
            str: Generated answer.
        """
        # Construct prompt (optimized for Mixtral instruct format)
        prompt = f"<s>[INST] Context: {context}\n\nQuestion: {query}\nAnswer: [/INST]"
        # Tokenize input
        inputs = self.tokenizer(prompt, return_tensors="pt")
        # Generate response
        outputs = self.model.generate(
            inputs["input_ids"],
            max_length=200,
            num_return_sequences=1,
            no_repeat_ngram_size=2,
            do_sample=True,  # Add some randomness for variety
            temperature=0.7  # Control creativity
        )
        # Decode and return
        answer = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
        # Extract just the answer after "[INST]"
        return answer.split("[/INST]")[1].strip() if "[/INST]" in answer else answer

    def answer_query(self, query):
        """
        Combine retrieval and generation for a full answer.
        
        Args:
            query (str): User's question.
        Returns:
            str: Final answer.
        """
        context_sentences = self.retrieve(query)
        context = ". ".join(context_sentences)
        return self.generate_answer(query, context)
    

# Test the class
if __name__ == "__main__":
    rag = RAGSystem()
    sample_sentences = ["The sky is blue.", "The grass is green.", "Water is wet."]
    rag.build_index(sample_sentences)
    query = "What color is the sky?"
    answer = rag.answer_query(query)
    print(f"Query: {query}")
    print(f"Answer: {answer}")