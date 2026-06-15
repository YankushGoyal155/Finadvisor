import os
import shutil
import random
import uvicorn
from pathlib import Path
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile

load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from add_data_clean import add_document_to_brain
from rag_service import RAGFinanceService
from db import (
    create_user, get_user_by_email, verify_user_password,
    create_otp, verify_otp, save_message, get_user_messages,
    get_user_threads, create_thread, get_thread_messages,
    delete_thread, delete_user_history
)
from utils import send_otp_email
from blob_service import blob_service

app = FastAPI(title="Finance AI API", version="1.0.0")

# Read allowed origins from environment — supports multiple comma-separated URLs
_raw_origins = os.getenv("FRONTEND_URL", "http://localhost:5173")
ALLOWED_ORIGINS = [o.strip() for o in _raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UserCredentials(BaseModel):
    username: str | None = None
    email: str
    password: str | None = None

class OTPRequest(BaseModel):
    email: str

class OTPVerify(BaseModel):
    email: str
    code: str

class ThreadRequest(BaseModel):
    user_id: int
    title: str

class ChatMessage(BaseModel):
    message: str
    model: str = "gpt-4o"
    user_id: int | None = None
    thread_id: int | None = None
    user_data: dict | None = None


ai_service: RAGFinanceService | None = None

@app.on_event("startup")
def startup_event():
    global ai_service
    print("Initializing RAG Service (Azure OpenAI)...")
    ai_service = RAGFinanceService()

@app.get("/")
def home():
    return {"status": "ok", "message": "Finance AI Backend is active! Azure GPT-4o is ready."}

@app.post("/register")
def handle_register(credentials: UserCredentials):
    if not credentials.username:
        return {"status": "error", "message": "Username is required for registration"}
    
    user_id, error = create_user(credentials.username, credentials.email, credentials.password)
    if error:
        return {"status": "error", "message": error}
    return {"status": "success", "user_id": user_id, "username": credentials.username, "email": credentials.email}

@app.post("/login")
def handle_login(credentials: UserCredentials):
    user = verify_user_password(credentials.email, credentials.password)
    if user:
        return {"status": "success", "user_id": user['id'], "username": user['username'], "email": user['email']}
    return {"status": "error", "message": "Invalid email or password"}

@app.post("/request-otp")
def handle_request_otp(request: OTPRequest):
    # OTP can be sent to anyone now (even if not in DB yet)
    otp_code = str(random.randint(100000, 999999))
    create_otp(request.email, otp_code)
    
    # Try sending real email
    sent = send_otp_email(request.email, otp_code)
    
    if sent:
        return {"status": "success", "message": "Verification code sent to your inbox!"}
    else:
        return {"status": "success", "message": "Email service paused (Credentials missing). Check backend console for code!"}

@app.post("/verify-otp")
def handle_verify_otp(verify: OTPVerify):
    if verify_otp(verify.email, verify.code):
        user = get_user_by_email(verify.email)
        
        # Auto-registration if user doesn't exist
        if not user:
            # Create a simple username from email
            username = verify.email.split('@')[0].capitalize()
            user_id, error = create_user(username, verify.email, None)
            if error:
                return {"status": "error", "message": f"Verified but failed to create profile: {error}"}
            user = {"id": user_id, "username": username, "email": verify.email}
            
        return {"status": "success", "user_id": user['id'], "username": user['username'], "email": user['email']}
    return {"status": "error", "message": "Invalid or expired OTP"}

@app.get("/threads/{user_id}")
def handle_get_threads(user_id: int):
    threads = get_user_threads(user_id)
    return {"status": "success", "threads": threads}

@app.post("/threads")
def handle_create_thread(request: ThreadRequest):
    thread_id = create_thread(request.user_id, request.title)
    return {"status": "success", "thread_id": thread_id}

@app.get("/threads/{thread_id}/messages")
def handle_get_thread_messages(thread_id: int):
    messages = get_thread_messages(thread_id)
    return {"status": "success", "messages": messages}

@app.delete("/threads/{thread_id}")
def handle_delete_thread(thread_id: int):
    delete_thread(thread_id)
    return {"status": "success", "message": "Thread deleted"}

@app.delete("/history/{user_id}")
def handle_delete_history(user_id: int):
    delete_user_history(user_id)
    return {"status": "success", "message": "Full history deleted"}

@app.post("/chat")
def handle_chat(chat: ChatMessage):
    if not ai_service:
        return {"response": "AI Service not fully loaded yet. Please wait a moment!"}

    if chat.user_id:
        # Save user message (including thread_id if provided)
        save_message(chat.user_id, "user", chat.message, thread_id=chat.thread_id)

    # Memory: Fetch thread history if it exists
    history = []
    if chat.thread_id:
        history = get_thread_messages(chat.thread_id)

    try:
        reply = ai_service.get_financial_advice(chat.message, model_name=chat.model, chat_history=history, user_data=chat.user_data)
        
        if chat.user_id:
            # Save AI response (including thread_id if provided)
            save_message(chat.user_id, "ai", reply, thread_id=chat.thread_id)
            
            # --- BLOB STORAGE BACKUP ---
            # Backup thread messages to Azure Blob Storage so the user's data is safely stored
            if chat.thread_id:
                try:
                    updated_history = get_thread_messages(chat.thread_id)
                    backup_data = {
                        "user_id": chat.user_id,
                        "thread_id": chat.thread_id,
                        "messages": updated_history
                    }
                    blob_name = f"users/user_{chat.user_id}/thread_{chat.thread_id}.json"
                    blob_service.upload_json(backup_data, blob_name)
                except Exception as e:
                    print(f"Failed to perform Blob Storage backup: {e}")
            
        return {"response": reply}
    except Exception as e:
        error_msg = f"An error occurred: {str(e)}"
        if chat.user_id:
            save_message(chat.user_id, "ai", error_msg, thread_id=chat.thread_id)
        return {"response": error_msg}

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    if not file.filename.endswith((".pdf", ".txt")):
        return {"response": "Unsupported file format!"}
    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # --- BLOB STORAGE UPLOAD ---
    # Upload the user's file to Azure Blob Storage
    try:
        blob_service.upload_file(file_path, f"documents/{file.filename}")
    except Exception as e:
        print(f"Failed to upload document to blob: {e}")
    try:
        add_document_to_brain(file_path)
        if ai_service:
            ai_service._initialize_knowledge()
        return {"response": f"Successfully learned {file.filename}!"}
    except Exception as e:
        return {"response": f"Error: {str(e)}"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
