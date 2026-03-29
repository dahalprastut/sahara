from fastapi import APIRouter
from app.core.ollama import ollama_service
from app.core.firebase import firebase_service
from app.models.schemas import HealthResponse
from datetime import datetime

router = APIRouter(prefix="/health")

@router.get("", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    ollama_status = ollama_service.check_health()
    # Firebase is considered healthy if either real connection or mock is available
    firebase_status = (firebase_service.db is not None) or firebase_service._use_mock
    
    overall_status = "healthy" if (ollama_status and firebase_status) else "degraded"
    
    return HealthResponse(
        status=overall_status,
        ollama_status=ollama_status,
        firebase_status=firebase_status,
        timestamp=datetime.now()
    )
