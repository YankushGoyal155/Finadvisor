import os
import glob
from add_data_clean import add_document_to_brain

DOCS_DIR = "./knowledge_docs"

def seed():
    if not os.path.exists(DOCS_DIR):
        print(f"❌ {DOCS_DIR} folder not found. Create it and add .txt/.pdf files.")
        return

    files = glob.glob(os.path.join(DOCS_DIR, "*.txt")) + glob.glob(os.path.join(DOCS_DIR, "*.pdf"))
    
    if not files:
        print(f"⚠️ No .txt or .pdf files found in {DOCS_DIR}")
        return

    print(f"📚 Found {len(files)} documents to ingest:\n")
    for f in files:
        print(f"  📄 {os.path.basename(f)}")
    
    print("\n" + "=" * 50)
    
    for f in files:
        print(f"\n{'=' * 50}")
        add_document_to_brain(f)
    
    print(f"\n✅ Seeding complete! Ingested {len(files)} documents into ChromaDB.")

if __name__ == "__main__":
    seed()
