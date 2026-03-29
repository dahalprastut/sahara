"""
Anxiety Intervention Chatbot Backend
Main entry point for FastAPI application
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from app.main import app

if __name__ == "__main__":
    import uvicorn
    from config.settings import settings
    
    print(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    print(f"📍 Server running at http://{settings.api_host}:{settings.api_port}")
    print(f"📚 API Docs available at http://{settings.api_host}:{settings.api_port}/docs")
    
    uvicorn.run(
        "app.main:app",
        host=settings.api_host,
        port=settings.api_port,
        reload=settings.api_debug
    )
