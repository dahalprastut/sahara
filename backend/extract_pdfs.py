import os
from PyPDF2 import PdfReader
import json

def extract_text_from_pdf(pdf_path, max_chars=1500):
    """Extract text from PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        # Clean up whitespace
        text = " ".join(text.split())
        return text[:max_chars] if text else None
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None

def load_pdfs_to_knowledge_base():
    """Load all PDFs and create Python dict entries"""
    documents_dir = "documents"
    
    if not os.path.exists(documents_dir):
        print(f"No {documents_dir} folder found")
        return
    
    files = os.listdir(documents_dir)
    pdf_files = sorted([f for f in files if f.endswith('.pdf')])
    
    careers_docs = []
    relationships_docs = []
    
    careers_keywords = ["career", "counseling", "employment", "job", "work", "training"]
    relationships_keywords = ["couples", "communication", "relationship", "therapy"]
    
    for idx, pdf_file in enumerate(pdf_files, 1):
        pdf_path = os.path.join(documents_dir, pdf_file)
        text = extract_text_from_pdf(pdf_path)
        
        if not text:
            continue
        
        # Categorize
        is_relationship = any(kw in pdf_file.lower() for kw in relationships_keywords)
        
        doc_entry = {
            "id": f"pdf_career_{idx}" if not is_relationship else f"pdf_rel_{idx}",
            "title": pdf_file.replace('.pdf', ''),
            "content": text,
            "category": "relationships" if is_relationship else "careers",
            "source": "pdf",
            "type": "external"
        }
        
        if is_relationship:
            relationships_docs.append(doc_entry)
        else:
            careers_docs.append(doc_entry)
    
    # Generate Python code
    code = "# PDF Documents - Auto-generated\n\n"
    
    code += "PDF_CAREERS = [\n"
    for doc in careers_docs:
        code += f'    {{\n'
        code += f'        "id": "{doc["id"]}",\n'
        code += f'        "title": "{doc["title"]}",\n'
        code += f'        "content": "{doc["content"].replace(chr(34), chr(39))}",\n'
        code += f'        "category": "careers",\n'
        code += f'        "source": "pdf",\n'
        code += f'        "type": "external"\n'
        code += f'    }},\n'
    code += "]\n\n"
    
    code += "PDF_RELATIONSHIPS = [\n"
    for doc in relationships_docs:
        code += f'    {{\n'
        code += f'        "id": "{doc["id"]}",\n'
        code += f'        "title": "{doc["title"]}",\n'
        code += f'        "content": "{doc["content"].replace(chr(34), chr(39))}",\n'
        code += f'        "category": "relationships",\n'
        code += f'        "source": "pdf",\n'
        code += f'        "type": "external"\n'
        code += f'    }},\n'
    code += "]\n"
    
    # Write to file
    with open("app/knowledge_base/pdf_documents.py", "w", encoding="utf-8") as f:
        f.write(code)
    
    print(f"✅ Generated pdf_documents.py")
    print(f"   - Career PDFs: {len(careers_docs)}")
    print(f"   - Relationship PDFs: {len(relationships_docs)}")
    print(f"\nNow restart your backend server for changes to take effect!")

if __name__ == "__main__":
    load_pdfs_to_knowledge_base()
