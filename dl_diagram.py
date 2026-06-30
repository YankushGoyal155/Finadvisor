import base64
import urllib.request
import os

def create_clear_diagram():
    with open(r"d:\Finace AI\diagram.mmd", "r", encoding="utf-8") as f:
        code = f.read()

    b64 = base64.urlsafe_b64encode(code.encode('utf-8')).decode('utf-8')
    url = f"https://mermaid.ink/img/{b64}?theme=default&bgColor=F8F9FA"

    out_path = r"d:\Finace AI\RAG_Diagram_Clear.png"
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
    try:
        with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
            out_file.write(response.read())
        print(f"✅ Success! Saved to {out_path}")
        os.system(f'explorer "{out_path}"')
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    create_clear_diagram()
