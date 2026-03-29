"""
FastAPI application setup and initialization
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import chatbot, health

# Create FastAPI app
app = FastAPI(
    title="Anxiety Intervention Chatbot API",
    description="Backend API for anxiety intervention chatbot with RAG pipeline",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, tags=["Health"])
app.include_router(chatbot.router, tags=["Chatbot"])

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint - system information"""
    return {
        "name": "Anxiety Intervention Chatbot API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs"
    }
