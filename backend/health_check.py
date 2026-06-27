"""
Finance AI — Full System Health Check
Run this script to verify ALL services are working correctly.
Usage: python health_check.py
"""

import os
import sys
import json
import sqlite3
from pathlib import Path
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).parent / '.env', override=True)

PASS = "✅ PASS"
FAIL = "❌ FAIL"
WARN = "⚠️  WARN"

results = []


def check(name, status, detail=""):
    results.append((name, status, detail))
    print(f"  {status} — {name}")
    if detail:
        print(f"         ↳ {detail}")


print("\n" + "=" * 60)
print("   🏥  FINANCE AI — FULL HEALTH CHECK")
print("=" * 60)

# ───────────────────────────────────────────────────────────
# 1. Environment Variables
# ───────────────────────────────────────────────────────────
print("\n📋 [1/5] ENVIRONMENT VARIABLES")
env_vars = {
    "AZURE_OPENAI_API_KEY": os.getenv("AZURE_OPENAI_API_KEY"),
    "AZURE_OPENAI_ENDPOINT": os.getenv("AZURE_OPENAI_ENDPOINT"),
    "AZURE_OPENAI_DEPLOYMENT_NAME": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME"),
    "AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME": os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME"),
    "AZURE_STORAGE_CONNECTION_STRING": os.getenv("AZURE_STORAGE_CONNECTION_STRING"),
}

for key, value in env_vars.items():
    if value:
        masked = value[:8] + "..." if len(value) > 12 else value
        check(key, PASS, f"Set ({masked})")
    else:
        check(key, FAIL, "NOT SET — add this to your .env file!")

# ───────────────────────────────────────────────────────────
# 2. Azure OpenAI Chat (GPT-4o-mini)
# ───────────────────────────────────────────────────────────
print("\n🤖 [2/5] AZURE OPENAI CHAT (gpt-4o-mini)")
try:
    from langchain_openai import AzureChatOpenAI
    llm = AzureChatOpenAI(
        azure_deployment=os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o-mini"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
        temperature=0,
    )
    response = llm.invoke("Say 'HEALTH CHECK OK' and nothing else.")
    reply = response.content.strip()
    check("Chat Model Connection", PASS, f"Response: {reply[:60]}")
except Exception as e:
    check("Chat Model Connection", FAIL, str(e)[:100])

# ───────────────────────────────────────────────────────────
# 3. Azure OpenAI Embeddings (text-embedding-3-small)
# ───────────────────────────────────────────────────────────
print("\n🧬 [3/5] AZURE OPENAI EMBEDDINGS (text-embedding-3-small)")
try:
    from langchain_openai import AzureOpenAIEmbeddings
    embeddings = AzureOpenAIEmbeddings(
        azure_deployment=os.getenv("AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME", "text-embedding-3-small"),
        api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2025-01-01-preview"),
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
    )
    test_vector = embeddings.embed_query("Test embedding for health check")
    vector_len = len(test_vector)
    check("Embedding Model Connection", PASS, f"Generated vector with {vector_len} dimensions")
except Exception as e:
    check("Embedding Model Connection", FAIL, str(e)[:100])

# ───────────────────────────────────────────────────────────
# 4. ChromaDB (Vector Store)
# ───────────────────────────────────────────────────────────
print("\n🧠 [4/5] CHROMADB (Vector Store)")
CHROMA_DIR = "./chroma_db"
try:
    from langchain_community.vectorstores import Chroma

    if os.path.exists(CHROMA_DIR):
        check("ChromaDB Directory", PASS, f"Found at {os.path.abspath(CHROMA_DIR)}")
        
        # Connect and count documents
        vector_store = Chroma(
            persist_directory=CHROMA_DIR,
            embedding_function=embeddings,
        )
        doc_count = vector_store._collection.count()
        
        if doc_count > 0:
            check("ChromaDB Documents", PASS, f"{doc_count} document chunks stored")
            
            # Test a similarity search
            test_results = vector_store.similarity_search("tax planning", k=2)
            if test_results:
                preview = test_results[0].page_content[:80].replace("\n", " ")
                check("ChromaDB Search", PASS, f"Search works! Top result: \"{preview}...\"")
            else:
                check("ChromaDB Search", WARN, "Search returned no results")
        else:
            check("ChromaDB Documents", WARN, "0 documents — run seed_knowledge.py or upload docs via the website")
    else:
        check("ChromaDB Directory", WARN, f"Not found at {os.path.abspath(CHROMA_DIR)} — no documents ingested yet")
except Exception as e:
    check("ChromaDB", FAIL, str(e)[:100])

# ───────────────────────────────────────────────────────────
# 5. SQLite (User Database)
# ───────────────────────────────────────────────────────────
print("\n🗄️  [5/5] SQLITE (User Database)")
DB_PATH = "./finance_ai.db"
try:
    if os.path.exists(DB_PATH):
        check("SQLite File", PASS, f"Found at {os.path.abspath(DB_PATH)} ({os.path.getsize(DB_PATH)} bytes)")
        
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # List all tables
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [row[0] for row in cursor.fetchall()]
        check("SQLite Tables", PASS, f"Tables: {', '.join(tables)}")
        
        # Count users
        if "users" in tables:
            cursor.execute("SELECT COUNT(*) FROM users;")
            user_count = cursor.fetchone()[0]
            check("Users", PASS, f"{user_count} registered user(s)")
        
        # Count messages
        if "messages" in tables:
            cursor.execute("SELECT COUNT(*) FROM messages;")
            msg_count = cursor.fetchone()[0]
            check("Messages", PASS, f"{msg_count} chat message(s) stored")
        
        # Count threads
        if "threads" in tables:
            cursor.execute("SELECT COUNT(*) FROM threads;")
            thread_count = cursor.fetchone()[0]
            check("Threads", PASS, f"{thread_count} chat thread(s)")
        
        conn.close()
    else:
        check("SQLite File", WARN, f"Not found at {DB_PATH} — will be created on first user registration")
except Exception as e:
    check("SQLite", FAIL, str(e)[:100])

# ───────────────────────────────────────────────────────────
# 6. Azure Blob Storage
# ───────────────────────────────────────────────────────────
print("\n☁️  [6/6] AZURE BLOB STORAGE")
try:
    from azure.storage.blob import BlobServiceClient
    
    conn_str = os.getenv("AZURE_STORAGE_CONNECTION_STRING")
    container_name = os.getenv("AZURE_STORAGE_CONTAINER_NAME", "finance-ai-data")
    
    if not conn_str:
        check("Blob Storage", FAIL, "AZURE_STORAGE_CONNECTION_STRING not set")
    else:
        blob_service_client = BlobServiceClient.from_connection_string(conn_str)
        container_client = blob_service_client.get_container_client(container_name)
        
        if container_client.exists():
            check("Blob Container", PASS, f"Container '{container_name}' exists and accessible")
            
            # List blobs (up to 20)
            blobs = list(container_client.list_blobs())
            if blobs:
                check("Blob Files", PASS, f"{len(blobs)} file(s) stored in cloud")
                print("\n         📁 Files in Azure Blob Storage:")
                for blob in blobs[:20]:
                    size_kb = round(blob.size / 1024, 1) if blob.size else 0
                    print(f"            • {blob.name} ({size_kb} KB)")
                if len(blobs) > 20:
                    print(f"            ... and {len(blobs) - 20} more")
            else:
                check("Blob Files", WARN, "Container is empty — files will appear after chat or document upload")
        else:
            check("Blob Container", WARN, f"Container '{container_name}' not found — will be created automatically")
except Exception as e:
    check("Blob Storage", FAIL, str(e)[:100])

# ───────────────────────────────────────────────────────────
# SUMMARY
# ───────────────────────────────────────────────────────────
print("\n" + "=" * 60)
print("   📊  SUMMARY")
print("=" * 60)

pass_count = sum(1 for _, s, _ in results if s == PASS)
fail_count = sum(1 for _, s, _ in results if s == FAIL)
warn_count = sum(1 for _, s, _ in results if s == WARN)

print(f"\n  ✅ Passed: {pass_count}")
print(f"  ❌ Failed: {fail_count}")
print(f"  ⚠️  Warnings: {warn_count}")

if fail_count == 0:
    print("\n  🎉 YOUR APP IS HEALTHY AND READY TO GO LIVE!")
else:
    print(f"\n  🔧 Fix the {fail_count} failed check(s) above before going live.")

print("\n" + "=" * 60 + "\n")
