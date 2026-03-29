"""
KNOWLEDGE BASE INGESTION PIPELINE - COMPLETE FLOW DOCUMENTATION

This document explains how data flows into the knowledge base and how it's used.
"""

PIPELINE_FLOW = """
╔════════════════════════════════════════════════════════════════════════════╗
║                 KNOWLEDGE BASE INGESTION PIPELINE                          ║
╚════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 1: DATA SOURCES                                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ① SYNTHETIC DATA (Hardcoded)                                              │
│     └─ File: app/knowledge_base/synthetic_data.py                          │
│     └─ Structure: Python dictionaries with keys:                           │
│        - "careers": 5 documents about career anxiety                       │
│        - "relationships": 5 documents about relationship anxiety           │
│        - "affirmations": 5 positive statements                             │
│        - "coping_techniques": 2 techniques (breathing, grounding)          │
│     └─ Format:                                                            │
│        {                                                                   │
│          "id": "career_1",                                                │
│          "title": "Job Interview Anxiety",                                │
│          "content": "Full text...",                                       │
│          "category": "careers",                                           │
│          "type": "advice"                                                 │
│        }                                                                  │
│                                                                              │
│  ② PDF DOCUMENTS (Extracted from files)                                    │
│     └─ Source: documents/ folder (10 PDF files)                           │
│     └─ Extraction: PyPDF2 library reads PDF -> extracts text (1500 chars) │
│     └─ File: app/knowledge_base/pdf_documents.py (auto-generated)         │
│     └─ Processing:                                                        │
│        extract_pdfs.py → reads PDFs → categorizes files → outputs         │
│        pdf_documents.py                                                   │
│     └─ Contains:                                                          │
│        - PDF_CAREERS: 8 documents from counseling PDFs                    │
│        - PDF_RELATIONSHIPS: 2 documents from couples therapy PDFs          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 2: DATA LOADING INTO MEMORY                                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  In: synthetic_data.py → KnowledgeBase._initialize_data()                 │
│                                                                              │
│  Step 1: Import PDF documents                                              │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ try:                                                    │               │
│  │     from pdf_documents import PDF_CAREERS,             │               │
│  │                                 PDF_RELATIONSHIPS      │               │
│  │ except ImportError:                                     │               │
│  │     PDF_CAREERS = []                                    │               │
│  │     PDF_RELATIONSHIPS = []                              │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  Step 2: Create base dictionary with synthetic data                        │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ data = {                                                │               │
│  │     "careers": [...5 synthetic docs...],                │               │
│  │     "relationships": [...5 synthetic docs...],          │               │
│  │     "affirmations": [...5 affirmations...],             │               │
│  │     "coping_techniques": [...2 techniques...]           │               │
│  │ }                                                        │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  Step 3: Extend with PDF documents                                         │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ if PDF_CAREERS:                                         │               │
│  │     data["careers"].extend(PDF_CAREERS)  # +8 PDFs      │               │
│  │ if PDF_RELATIONSHIPS:                                   │               │
│  │     data["relationships"].extend(PDF_RELATIONSHIPS)     │               │
│  │                                                  # +2 PDFs              │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  RESULT IN MEMORY:                                                         │
│  ├─ careers: 13 total docs (5 synthetic + 8 PDFs)                         │
│  ├─ relationships: 7 total docs (5 synthetic + 2 PDFs)                    │
│  ├─ affirmations: 5 docs                                                   │
│  └─ coping_techniques: 2 docs                                              │
│  ✅ TOTAL: 27 documents in memory                                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 3: RETRIEVAL (SEARCHING)                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  In: KnowledgeBase.search(query, category, top_k)                          │
│                                                                              │
│  INPUT:                                                                    │
│  ├─ query: "I have a job interview tomorrow and I'm nervous"              │
│  ├─ category: "careers"                                                    │
│  └─ top_k: 3 (return top 3 matching documents)                             │
│                                                                              │
│  ALGORITHM: Word Matching Similarity                                       │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ def _similarity_score(query, text):                     │               │
│  │     query_words = query.split()                         │               │
│  │     matches = sum(1 for word in query_words            │               │
│  │                  if word in text.lower())               │               │
│  │     return matches / len(query_words)                   │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  EXAMPLE SCORING:                                                          │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ Query: "job interview tomorrow nervous"                 │               │
│  │ (4 matching keywords)                                   │               │
│  │                                                          │               │
│  │ Document 1 (PDF): Contains "job", "interview"           │               │
│  │   Score = 2/4 = 0.50                                    │               │
│  │                                                          │               │
│  │ Document 2 (Synthetic): "Job Interview Anxiety"         │               │
│  │   Contains "job", "interview", "anxiety" (3 of 4)       │               │
│  │   Score = 3/4 = 0.75 ⭐ HIGHER                          │               │
│  │                                                          │               │
│  │ Document 3 (PDF): Contains "interview", "nervous"       │               │
│  │   Score = 2/4 = 0.50                                    │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  OUTPUT (sorted by score):                                                 │
│  ├─ [1] career_1 (Job Interview Anxiety) - score: 0.75                     │
│  ├─ [2] pdf_career_2 (excerpt mentioning interviews) - score: 0.50        │
│  └─ [3] pdf_career_1 (Career Counseling guide) - score: 0.50              │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 4: AUGMENTATION IN RAG PIPELINE                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  File: app/services/rag_service.py                                         │
│                                                                              │
│  RAGPipeline.generate_response() flow:                                     │
│                                                                              │
│  ① Call retrieve_relevant_knowledge()                                      │
│     └─ Searches knowledge base for relevant documents                      │
│     └─ Returns top 3 documents with highest similarity scores              │
│                                                                              │
│  ② Get user context (personalization)                                     │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ user_context = firebase_service.get_user_context(      │               │
│  │     user_id                                             │               │
│  │ )                                                        │               │
│  │ # Returns user's past triggers, anxiety history, etc.   │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  ③ Build augmented prompt                                                 │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ prompt = f"""                                           │               │
│  │ You are a compassionate mental health specialist.       │               │
│  │                                                          │               │
│  │ Context Information:                                    │               │
│  │ {retrieved_knowledge}  ← TOP 3 DOCUMENTS INJECTED HERE  │               │
│  │                                                          │               │
│  │ User History:                                           │               │
│  │ {user_context}  ← PERSONALIZATION DATA HERE             │               │
│  │                                                          │               │
│  │ User's anxiety type: {anxiety_type}                     │               │
│  │ User's Query: {user_query}                              │               │
│  │ """                                                      │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  ④ Send to LLM (Ollama llama3:8b)                                          │
│     └─ LLM generates personalized response using:                          │
│        • Retrieved knowledge as context                                    │
│        • User personalization data                                         │
│        • System prompt (compassionate counselor tone)                      │
│                                                                              │
│  ⑤ Sanitize response (safety guardrails)                                   │
│     └─ Remove any harmful content                                          │
│     └─ Add safety disclaimers                                              │
│     └─ Check for crisis indicators                                         │
│                                                                              │
│  OUTPUT:                                                                   │
│  "I completely understand how you're feeling about your interview          │
│   tomorrow. Based on best practices in career counseling, here are some    │
│   strategies... [personalized advice informed by retrieved documents]"     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│ STAGE 5: RESPONSE DELIVERY & STORAGE                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ① Text-to-Speech (optional)                                               │
│     └─ If mode="voice", convert response to audio using pyttsx3            │
│                                                                              │
│  ② Store in Firebase                                                       │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ firebase_service.add_message(user_id, conv_id, {        │               │
│  │     "role": "bot",                                      │               │
│  │     "text": response_text,                              │               │
│  │     "audioUrl": audio_url,                              │               │
│  │     "responseType": "rag_response"                      │               │
│  │ })                                                       │               │
│  │ # Stores in conversation history                        │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
│  ③ Return to user                                                          │
│  ┌─────────────────────────────────────────────────────────┐               │
│  │ ChatbotResponse(                                        │               │
│  │     conversation_id: "uuid...",                         │               │
│  │     response_text: "...",                               │               │
│  │     audio_url: "gs://...",                              │               │
│  │     mode: "text",                                       │               │
│  │     timestamp: "2026-03-28T..."                         │               │
│  │ )                                                        │               │
│  └─────────────────────────────────────────────────────────┘               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

COMPLETE DATA STRUCTURE IN MEMORY
═════════════════════════════════════════════════════════════════════════════

self.data = {
    "careers": [
        # SYNTHETIC DOCUMENTS (5)
        {
            "id": "career_1",
            "title": "Job Interview Anxiety",
            "content": "...",
            "category": "careers",
            "type": "advice",
            "source": None  ← Synthetic
        },
        ...4 more synthetic...
        
        # PDF DOCUMENTS (8)  
        {
            "id": "pdf_career_1",
            "title": "Career Counseling Training Guide 2023",
            "content": "...extracted from PDF...",
            "category": "careers",
            "type": "external",
            "source": "pdf"  ← From PDF
        },
        ...7 more PDFs...
    ],
    
    "relationships": [
        # SYNTHETIC (5)
        {...},
        
        # PDF (2)
        {
            "id": "pdf_rel_4",
            "title": "Couples Communication Workbook",
            "content": "...extracted from PDF...",
            "source": "pdf"
        },
        ...1 more PDF...
    ],
    
    "affirmations": [
        # SYNTHETIC ONLY (5)
        {
            "id": "aff_1",
            "content": "You are capable of handling whatever comes your way.",
            "type": "empowerment"
        },
        ...4 more...
    ],
    
    "coping_techniques": [
        # SYNTHETIC ONLY (2)
        {
            "id": "tech_1",
            "title": "4-7-8 Breathing",
            "content": "...",
            "type": "breathing"
        },
        ...1 more technique...
    ]
}

KEY FEATURES OF THIS INGESTION PIPELINE
════════════════════════════════════════════════════════════════════════════

✅ MODULAR:
   - Synthetic and PDF sources kept separate
   - Easy to add new sources (databases, APIs, etc.)

✅ LAZY LOADING:
   - PDFs imported only if file exists
   - Graceful fallback if imports fail

✅ SCALABLE:
   - Can add 100+ PDFs without code changes
   - Automatic categorization based on keywords

✅ FLEXIBLE SEARCH:
   - Word-matching similarity (can upgrade to semantic search later)
   - Top-k retrieval (default: top 3 most relevant)
   - Category-aware searching

✅ PERSONALIZATION:
   - Combines knowledge base with user context
   - Stores and retrieves user history
   - Tailors responses to individual user

✅ SAFETY:
   - Sanitizes responses before delivery
   - Detects and handles crisis situations
   - Prevents harmful content in outputs

HOW TO ADD MORE DATA
════════════════════════════════════════════════════════════════════════════

Option 1: Add Synthetic Data (Hardcoded)
──────────────────────────────────────────
1. Open: app/knowledge_base/synthetic_data.py
2. In _initialize_data(), add new dict to "careers"/"relationships":
   {
       "id": "your_id",
       "title": "Your Title",
       "content": "Your content...",
       "category": "careers",
       "type": "advice"
   }
3. Restart server

Option 2: Add PDFs (Automatic Extraction)
──────────────────────────────────────────
1. Add PDF files to: documents/ folder
2. Run: python extract_pdfs.py
3. This autogenerates: app/knowledge_base/pdf_documents.py
4. Restart server - PDFs automatically loaded!

Option 3: Connect to External Database
──────────────────────────────────────────
1. Modify KnowledgeBase._initialize_data()
2. Query your database (PostgreSQL, MongoDB, etc.)
3. Convert to same document format
4. Extend self.data dictionaries

Option 4: Add Semantic Search (Future)
──────────────────────────────────────────
1. Replace _similarity_score() with embedding-based search
2. Use Ollama embeddings or vector DB (Pinecone, Qdrant)
3. Improves relevance of retrieved documents
4. No code changes needed in RAG pipeline!
"""

print(PIPELINE_FLOW)

# Let's also create a simple diagram
SIMPLE_DIAGRAM = """

DATA FLOW DIAGRAM:
══════════════════════════════════════════════════════════════════════════════

USER QUERY "I'm nervous about job interview"
        ↓
    [SEARCH MECHANISM]
        ↓
Knowledge Base (27 docs in memory)
├── careers (13 docs):        ┬─ 5 synthetic
│                             └─ 8 from PDFs
├── relationships (7 docs):   ┬─ 5 synthetic
│                             └─ 2 from PDFs
├── affirmations (5 docs):    └─ 5 synthetic
└── coping_techniques (2):    └─ 2 synthetic
        ↓
[SIMILARITY MATCHING - Word Count]
        ↓
Top 3 Matching Documents Retrieved
├─ career_1: "Job Interview Anxiety" (score: 0.75)
├─ pdf_career_2: "Career transitions..." (score: 0.50)
└─ pdf_career_3: "Counseling strategies..." (score: 0.45)
        ↓
[RAG PIPELINE - AUGMENTATION]
        ↓
Build Prompt with:
├─ User's query
├─ Retrieved documents (context)
├─ User's history/personalization
└─ System prompt (compassionate counselor)
        ↓
[LLM - OLLAMA (llama3:8b)]
        ↓
Generate Response: "I understand your worry. Based on career
counseling best practices... [informed by retrieved docs]"
        ↓
[SAFETY CHECK]
        ↓
Add Disclaimer + Check for Harmful Content
        ↓
Return to User as JSON:
{
    "conversation_id": "...",
    "response_text": "...",
    "timestamp": "..."
}
        ↓
Store in Firebase (if available, else Mock Firebase)

"""

print(SIMPLE_DIAGRAM)
