from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

# Request Models
class ChatbotRequest(BaseModel):
    """Request model for chatbot interaction"""
    user_id: str = Field(..., description="Unique user identifier")
    query: str = Field(..., min_length=1, max_length=1000, description="User's message/query")
    mode: str = Field(default="text", description="Response mode: 'text' or 'voice'")
    anxiety_type: str = Field(default="general", description="Type of anxiety: 'social', 'general', 'panic', 'relationships', 'careers'")
    anxiety_level: Optional[int] = Field(default=5, ge=1, le=10, description="Current anxiety level 1-10")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID")

class UserProfileRequest(BaseModel):
    """Request model for user profile creation"""
    name: str = Field(..., min_length=1, description="User's name")
    email: str = Field(..., description="User's email")
    anxiety_type: str = Field(default="general", description="Primary anxiety type")
    age_range: Optional[str] = Field(None, description="Age range: '18-25', '25-35', etc.")
    preferences: Optional[dict] = Field({}, description="User preferences")

class TriggerRequest(BaseModel):
    """Request model for adding anxiety trigger"""
    trigger: str = Field(..., min_length=1, description="Trigger description")
    frequency: str = Field(default="sometimes", description="Frequency: 'always', 'often', 'sometimes', 'rarely'")
    severity: int = Field(default=5, ge=1, le=10, description="Trigger severity 1-10")
    context: Optional[str] = Field(None, description="Context where trigger occurs")

# Response Models
class ChatbotResponse(BaseModel):
    """Response model for chatbot interaction"""
    conversation_id: str = Field(..., description="Conversation ID")
    response_text: str = Field(..., description="Generated response")
    audio_url: Optional[str] = Field(None, description="Audio file URL (if voice mode)")
    mode: str = Field(..., description="Response mode used")
    updated_anxiety_level: Optional[int] = Field(None, description="Updated anxiety level after response")
    effectiveness_rating: Optional[int] = Field(None, description="User's rating of response effectiveness")
    timestamp: datetime = Field(default_factory=datetime.now)

class UserProfileResponse(BaseModel):
    """Response model for user profile"""
    user_id: str = Field(..., description="Unique user identifier")
    name: str = Field(..., description="User's name")
    email: str = Field(..., description="User's email")
    anxiety_type: str = Field(..., description="Primary anxiety type")
    created_at: datetime = Field(default_factory=datetime.now)
    profile_complete: bool = Field(default=False, description="Is profile setup complete?")

class AffirmationResponse(BaseModel):
    """Response model for affirmation"""
    affirmation: str = Field(..., description="Generated affirmation")
    mode: str = Field(..., description="Response mode: 'text' or 'voice'")
    audio_url: Optional[str] = Field(None, description="Audio URL if voice mode")

class AssessmentResponse(BaseModel):
    """Response model for anxiety assessment"""
    assessment_id: str = Field(..., description="Assessment ID (e.g., 'GAD-7')")
    score: int = Field(..., description="Assessment score")
    severity_level: str = Field(..., description="Severity level: 'mild', 'moderate', 'severe'")
    recommendations: List[str] = Field(default_factory=list, description="Recommended interventions")

class ErrorResponse(BaseModel):
    """Response model for errors"""
    error: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")
    details: Optional[dict] = Field(None, description="Additional error details")

class HealthResponse(BaseModel):
    """Response model for health check"""
    status: str = Field(..., description="Service status")
    ollama_status: bool = Field(..., description="Ollama service status")
    firebase_status: bool = Field(..., description="Firebase status")
    timestamp: datetime = Field(default_factory=datetime.now)
