import os
from PyPDF2 import PdfReader
import json

def extract_text_from_pdf(pdf_path):
    """Extract text from PDF file"""
    try:
        reader = PdfReader(pdf_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text[:1000]  # Limit to first 1000 chars
    except Exception as e:
        print(f"Error reading {pdf_path}: {e}")
        return None

def load_pdfs_to_knowledge_base():
    """Load all PDFs and add to knowledge base"""
    documents_dir = "documents"
    
    if not os.path.exists(documents_dir):
        print(f"No {documents_dir} folder found")
        return
    
    files = os.listdir(documents_dir)
    pdf_files = [f for f in files if f.endswith('.pdf')]
    
    print(f"Found {len(pdf_files)} PDF files\n")
    
    careers_docs = []
    relationships_docs = []
    
    careers_keywords = ["career", "counseling", "employment", "job", "work"]
    relationships_keywords = ["couples", "communication", "relationship", "therapy"]
    
    for idx, pdf_file in enumerate(pdf_files, 1):
        pdf_path = os.path.join(documents_dir, pdf_file)
        print(f"Processing {idx}/{len(pdf_files)}: {pdf_file}")
        
        text = extract_text_from_pdf(pdf_path)
        if not text:
            print(f"  - Skipped (could not extract text)")
            continue
        
        # Categorize based on filename
        is_career = any(kw in pdf_file.lower() for kw in careers_keywords)
        is_relationship = any(kw in pdf_file.lower() for kw in relationships_keywords)
        
        doc_entry = {
            "id": f"pdf_{idx}",
            "title": pdf_file.replace('.pdf', ''),
            "content": text,
            "source": "pdf",
            "type": "external"
        }
        
        if is_career or (not is_relationship):  # Default to career
            careers_docs.append(doc_entry)
            print(f"  - Added to CAREERS")
        else:
            relationships_docs.append(doc_entry)
            print(f"  - Added to RELATIONSHIPS")
    
    print(f"\n✅ SUMMARY:")
    print(f"Career docs: {len(careers_docs)}")
    print(f"Relationship docs: {len(relationships_docs)}")
    
    return careers_docs, relationships_docs

if __name__ == "__main__":
    careers, relationships = load_pdfs_to_knowledge_base()
    print("\nNow update synthetic_data.py with these documents")
