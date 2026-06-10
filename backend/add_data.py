import os
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Initialize the Embeddings
embeddings = OllamaEmbeddings(model="nomic-embed-text")
db_dir = "./chroma_db"

def add_document_to_brain(file_path: str):
    # Strip quotes if the user pasted them
    file_path = file_path.strip().strip('"').strip("'")
    
    if not os.path.exists(file_path):
        print(f"❌ File not found at: {file_path}")
        return

    print(f"📂 Loading document: {file_path}")

    try:
        if file_path.lower().endswith(".pdf"):
            documents = PyPDFLoader(file_path).load()
        elif file_path.lower().endswith(".txt"):
            documents = TextLoader(file_path, encoding="utf-8").load()
        else:
            print("⚠️ Unsupported format! Use .pdf or .txt")
            return
    except Exception as e:
        print(f"❌ Error loading file: {e}")
        return

    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=700, chunk_overlap=100)
    chunks = text_splitter.split_documents(documents)
    print(f"✂️ Split into {len(chunks)} knowledge chunks.")

    # Save to Chroma
    print("🧠 Adding to Finance AI Brain...")
    vector_store = Chroma(persist_directory=db_dir, embedding_function=embeddings)
    vector_store.add_documents(chunks)
    
    print("✅ Success! Your AI now knows this document.")

if __name__ == "__main__":
    print("--- Finance AI Knowledge Ingestion ---")
    path = input("Enter path to PDF/TXT (just paste it): ")
    add_document_to_brain(path)
