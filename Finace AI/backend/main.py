import os
import shutil

import uvicorn
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from add_data_clean import add_document_to_brain
from rag_service import RAGFinanceService

app = FastAPI(title="Finance AI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    message: str
    model: str = "llama3:latest"


ai_service: RAGFinanceService | None = None


@app.on_event("startup")
def startup_event():
    global ai_service
    print("Initializing RAG Service (Llama3)...")
    ai_service = RAGFinanceService()


@app.get("/")
def home():
    return {"status": "ok", "message": "Finance AI Backend is active! Llama 3 is waiting."}


@app.post("/chat")
def handle_chat(chat: ChatMessage):
    if not ai_service:
        return {"response": "AI Service not fully loaded yet. Please wait a moment!"}

    try:
        reply = ai_service.get_financial_advice(chat.message, model_name=chat.model)
        return {"response": reply}
    except Exception as e:
        return {"response": f"An error occurred while talking to Llama 3: {str(e)}"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".txt")):
        return {"response": "Unsupported file format! Please upload a .pdf or .txt file."}

    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        add_document_to_brain(file_path)
        if ai_service:
            ai_service._initialize_knowledge()
        return {"response": f"Successfully learned the contents of {file.filename}!"}
    except Exception as e:
        return {"response": f"Error parsing document: {str(e)}"}


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

