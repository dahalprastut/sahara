# Anxiety Intervention Chatbot Backend API

A FastAPI-based backend for an anxiety intervention chatbot that uses RAG (Retrieval-Augmented Generation) with Ollama and Firebase for personalized mental health support.

## Features

✅ **FastAPI Backend** - High-performance async API  
✅ **LangChain + Ollama Integration** - Local LLM with llama2:8b  
✅ **RAG Pipeline** - Retrieval-Augmented Generation for contextual responses  
✅ **Firebase Integration** - User data, conversations, and knowledge base storage  
✅ **Synthetic Dataset** - Curated content for careers and relationships anxiety  
✅ **Text-to-Speech** - Local pyttsx3 for voice responses (no external APIs)  
✅ **User Personalization** - Tracks triggers, patterns, and preferences  
✅ **Crisis Detection** - Special handling for high-severity anxiety  

## Architecture

```
backend/
├── app/
│   ├── core/                    # Core services
│   │   ├── firebase.py          # Firebase operations
│   │   ├── ollama.py            # Ollama LLM
│   │   └── tts.py               # Text-to-speech
│   ├── services/
│   │   └── rag_service.py       # RAG pipeline
│   ├── models/
│   │   └── schemas.py           # Pydantic models
│   ├── routes/
│   │   ├── chatbot.py           # Main chatbot endpoints
│   │   └── health.py            # Health check
│   ├── knowledge_base/
│   │   └── synthetic_data.py    # Synthetic dataset
│   └── main.py                  # FastAPI app
├── config/
│   └── settings.py              # Configuration
├── requirements.txt             # Dependencies
├── .env.example                 # Environment variables template
├── main.py                      # Entry point
└── README.md                    # This file
```

## Prerequisites

1. **Python 3.9+**
2. **Ollama** with llama2:8b model
   - Download from: https://ollama.ai
   - Run: `ollama pull llama2:8b`
3. **Firebase Project** with service account key
4. **Git** (optional)

## Installation

### 1. Clone/Setup Project

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Setup Environment Variables

```bash
# Copy example to .env
cp .env.example .env

# Edit .env with your values
```

**Required .env variables:**
```
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_auth_domain
FIREBASE_DATABASE_URL=your_db_url
FIREBASE_STORAGE_BUCKET=your_bucket
FIREBASE_SERVICE_ACCOUNT_KEY=path/to/serviceAccountKey.json

OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama2:8b

API_PORT=8000
API_DEBUG=True
```

### 5. Get Firebase Service Account Key

1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Download JSON file
4. Save to `backend/serviceAccountKey.json`

## Running the Backend

### 1. Start Ollama Server

```bash
# In a separate terminal
ollama serve

# Once running, verify llama2:8b is available
ollama pull llama2:8b
```

### 2. Start FastAPI Server

```bash
# From backend directory
python main.py

# Or use uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

API Documentation: **http://localhost:8000/docs** (Swagger UI)

## API Endpoints

### Health Check
```
GET /api/v1/health
```

### User Profile Management
```
POST   /api/v1/chatbot/user/profile
GET    /api/v1/chatbot/user/{user_id}/profile
POST   /api/v1/chatbot/user/{user_id}/trigger
GET    /api/v1/chatbot/user/{user_id}/triggers
```

### Chatbot Interaction
```
POST   /api/v1/chatbot/chat                     # Main chat endpoint
POST   /api/v1/chatbot/affirmation              # Get affirmation
GET    /api/v1/chatbot/knowledge/{category}    # Get knowledge base
POST   /api/v1/chatbot/crisis-check             # Crisis detection
```

## Testing with Postman

### 1. Create Postman Collection

#### Import Variables
```json
{
  "BASE_URL": "http://localhost:8000/api/v1",
  "USER_ID": "user_12345",
  "CONVERSATION_ID": ""
}
```

### 2. Test Endpoints

#### **1. Health Check**
```
GET {{BASE_URL}}/health

Expected Response:
{
  "status": "healthy",
  "ollama_status": true,
  "firebase_status": true,
  "timestamp": "2026-03-28T..."
}
```

#### **2. Create User Profile**
```
POST {{BASE_URL}}/chatbot/user/profile
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "anxiety_type": "social",
  "age_range": "25-35",
  "preferences": {
    "language": "en",
    "timezone": "UTC"
  }
}

Response saves {{USER_ID}} from response
```

#### **3. Add Anxiety Trigger**
```
POST {{BASE_URL}}/chatbot/user/{{USER_ID}}/trigger
Content-Type: application/json

{
  "trigger": "public speaking",
  "frequency": "often",
  "severity": 8,
  "context": "work presentations"
}
```

#### **4. Chat with Bot (Text)**
```
POST {{BASE_URL}}/chatbot/chat
Content-Type: application/json

{
  "user_id": "{{USER_ID}}",
  "query": "I'm worried about my job interview tomorrow",
  "mode": "text",
  "anxiety_type": "careers",
  "anxiety_level": 7
}

Response saves {{CONVERSATION_ID}} from response
```

#### **5. Chat with Bot (Voice)**
```
POST {{BASE_URL}}/chatbot/chat
Content-Type: application/json

{
  "user_id": "{{USER_ID}}",
  "query": "How can I handle social anxiety at work?",
  "mode": "voice",
  "anxiety_type": "social",
  "anxiety_level": 6,
  "conversation_id": "{{CONVERSATION_ID}}"
}

Listen to audio_url in response
```

#### **6. Get Affirmation**
```
POST {{BASE_URL}}/chatbot/affirmation?user_id={{USER_ID}}&anxiety_type=careers&mode=text

Response:
{
  "affirmation": "You are capable of handling whatever comes your way.",
  "mode": "text",
  "audio_url": null
}
```

#### **7. Get Knowledge Base**
```
GET {{BASE_URL}}/chatbot/knowledge/careers?query=job+interview&top_k=3

Response:
{
  "category": "careers",
  "results": [
    {
      "id": "career_1",
      "title": "Job Interview Anxiety",
      "content": "...",
      "type": "advice"
    }
  ]
}
```

#### **8. Crisis Check**
```
POST {{BASE_URL}}/chatbot/crisis-check?user_id={{USER_ID}}&severity=9

Response:
{
  "status": "crisis",
  "message": "I hear that you're going through...",
  "recommendation": "Please contact a mental health professional"
}
```

#### **9. Get Conversation**
```
GET {{BASE_URL}}/chatbot/conversation/{{USER_ID}}/{{CONVERSATION_ID}}
```

#### **10. Update Conversation Feedback**
```
POST {{BASE_URL}}/chatbot/conversation/{{USER_ID}}/{{CONVERSATION_ID}}/update
Content-Type: application/json

{
  "anxiety_level_end": 4,
  "effectiveness_rating": 8
}
```

## Postman Collection File

Create `chatbot_api.postman_collection.json` with all endpoints:

```json
{
  "info": {
    "name": "Anxiety Chatbot API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Health Check",
      "request": {
        "method": "GET",
        "url": "{{BASE_URL}}/health"
      }
    },
    ...more endpoints
  ]
}
```

## Running Tests with Postman

1. **Install Postman**: https://www.postman.com
2. **Import Collection**: File → Import → chatbot_api.postman_collection.json
3. **Set Variables**: 
   - BASE_URL: http://localhost:8000/api/v1
   - USER_ID: (generated after first call)
4. **Run Requests Sequentially**:
   - Health → Create User → Add Trigger → Chat → Affirmation → etc.

## Knowledge Base Structure

### Careers Anxiety
- Job Interview Anxiety
- Understanding Career Transitions
- Imposter Syndrome
- Work-Life Balance
- Public Speaking

### Relationships Anxiety
- Social Anxiety in Relationships
- Conflict Resolution
- Loneliness and Connection
- Setting Boundaries
- Dating Anxiety

### Affirmations
- Self-empowerment
- Self-worth
- Hope
- Self-compassion
- Encouragement

### Coping Techniques
- 4-7-8 Breathing
- Grounding 5-4-3-2-1

## Firebase Data Structure

```
users/{user_id}/
  ├── name, email, anxiety_type
  ├── triggers/ [collection]
  ├── conversations/ [collection]
  │   └── messages/ [subcollection]
  ├── affirmationHistory/ [collection]
  ├── assessmentResponses/ [collection]
  └── personalisedKnowledge/ [collection]

affirmations/ [collection]
interventions/ [collection]
assessments/ [collection]
userProgress/ [collection]
```

## Troubleshooting

### Ollama Connection Error
```
Error: Failed to connect to Ollama at http://localhost:11434
Solution: Make sure Ollama is running: ollama serve
```

### Firebase Authentication Error
```
Error: Failed to initialize Firebase
Solution: Check serviceAccountKey.json path in .env
```

### Model Not Found
```
Error: Model llama2:8b not found
Solution: Run: ollama pull llama2:8b
```

### CORS Issues (Frontend connection)
- CORS is configured for all origins in main.py
- Change `allow_origins=["*"]` to specific domains in production

## Performance Tips

1. **Ollama Model Tuning**:
   - Temperature: 0.5 (more consistent), 0.7-0.9 (more creative)
   - Use smaller model (llama2:7b) for faster responses

2. **Firebase Optimization**:
   - Create indexes for frequently queried fields
   - Use pagination for large datasets

3. **TTS Performance**:
   - Cache common affirmations
   - Pre-generate voice files for static responses

## Production Deployment

1. Set `API_DEBUG=False` in .env
2. Use production Firebase project
3. Scale Ollama service or use cloud LLM
4. Add authentication/authorization
5. Implement rate limiting
6. Use HTTPS
7. Add logging and monitoring

## Contributing

- Modify knowledge base in `app/knowledge_base/synthetic_data.py`
- Add new routes in `app/routes/`
- Update models in `app/models/schemas.py`

## License

MIT

---

**Questions?** Check the API docs at http://localhost:8000/docs
