import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_openai import AzureOpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

from blob_service import blob_service

# ✅ Use Azure OpenAI Embeddings instead of Ollama
embeddings = AzureOpenAIEmbeddings(
    azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME", "text-embedding-3-small"),
    api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
    api_key=os.getenv("AZURE_OPENAI_API_KEY"),
    azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
)

db_dir = "./chroma_db"


def add_document_to_brain(file_path: str):
    """Load a PDF or TXT file, split it, embed it, and store in ChromaDB."""
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

    # --- Automatically upload to Azure Blob Storage ---
    file_name = os.path.basename(file_path)
    blob_name = f"documents/{file_name}"
    print(f"☁️ Uploading to Azure Blob Storage ({blob_name})...")
    
    try:
        blob_service.upload_file(file_path, blob_name)
    except Exception as e:
        print(f"⚠️ Failed to upload to Azure Blob Storage: {e}")
        # Continuing with vector database insertion even if upload fails
        
    # Split into chunks
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(documents)
    print(f"✂️ Split into {len(chunks)} knowledge chunks.")

    if len(chunks) == 0:
        print("⚠️ No content could be extracted from this document.")
        return

    # Store in ChromaDB with Azure embeddings
    print("🧠 Adding to Finance AI Brain...")
    vector_store = Chroma(persist_directory=db_dir, embedding_function=embeddings)
    vector_store.add_documents(chunks)

    print("✅ Success! Your AI now knows this document.")


if __name__ == "__main__":
    print("--- Finance AI Knowledge Ingestion ---")
    path = input("Enter path to PDF/TXT (just paste it): ")
    add_document_to_brain(path)
