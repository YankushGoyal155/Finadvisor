import os
import subprocess
import sys

def main():
    print("Installing pypandoc...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pypandoc"])
    
    import pypandoc
    print("Downloading pandoc...")
    pypandoc.download_pandoc()
    
    # Path to the markdown file (the artifact we just created)
    md_file = r"C:\Users\ASUS\.gemini\antigravity\brain\f15f3538-3cce-4af4-885b-c803c50101f6\rag_implementation_roadmap.md"
    docx_file = r"d:\Finace AI\RAG_Implementation_Roadmap.docx"
    
    if not os.path.exists(md_file):
        print(f"Error: {md_file} not found!")
        return

    print("Converting to DOCX...")
    pypandoc.convert_file(md_file, 'docx', outputfile=docx_file)
    print(f"\n✅ Successfully created: {docx_file}")

if __name__ == "__main__":
    main()
