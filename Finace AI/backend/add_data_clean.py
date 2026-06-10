import os

from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_text_splitters import RecursiveCharacterTextSplitter

embeddings = OllamaEmbeddings(model="nomic-embed-text")
db_dir = "./chroma_db"


def add_document_to_brain(file_path: str):
    print(f"Loading document: {file_path}")

    if file_path.endswith(".pdf"):
        documents = PyPDFLoader(file_path).load()
    elif file_path.endswith(".txt"):
        documents = TextLoader(file_path, encoding="utf-8").load()
    else:
        print("Unsupported file format! Please use .pdf or .txt")
        return

    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = text_splitter.split_documents(documents)
    print(f"Document split into {len(chunks)} knowledge chunks.")

    if os.path.exists(db_dir):
        print("Adding to existing Database...")
        vector_store = Chroma(persist_directory=db_dir, embedding_function=embeddings)
        vector_store.add_documents(chunks)
    else:
        print("Creating new Database...")
        Chroma.from_documents(documents=chunks, embedding=embeddings, persist_directory=db_dir)

    print("✅ Successfully added to the Finance AI Brain!")

