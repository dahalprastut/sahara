from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    ChatbotRequest, ChatbotResponse, UserProfileRequest, UserProfileResponse,
    AffirmationResponse, TriggerRequest, ErrorResponse
)
from app.services.rag_service import rag_pipeline
from app.core.firebase import firebase_service
from app.core.tts import tts_service
from app.core.safety import SafetyGuardrail
from app.knowledge_base.synthetic_data import knowledge_base
import uuid
from datetime import datetime
import base64

router = APIRouter(prefix="/api")

# ============ USER PROFILE ENDPOINTS ============

@router.post("/user/profile", response_model=UserProfileResponse)
async def create_user_profile(user_data: UserProfileRequest):
    """Create or update user profile"""
    try:
        user_id = str(uuid.uuid4())
        
        profile_data = {
            "name": user_data.name,
            "email": user_data.email,
            "anxietyType": user_data.anxiety_type,
            "ageRange": user_data.age_range,
            "preferences": user_data.preferences,
            "profileComplete": True
        }
        
        success = firebase_service.create_user_profile(user_id, profile_data)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user profile"
            )
        
        return UserProfileResponse(
            user_id=user_id,
            name=user_data.name,
            email=user_data.email,
            anxiety_type=user_data.anxiety_type,
            profile_complete=True
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/user/{user_id}/profile", response_model=UserProfileResponse)
async def get_user_profile(user_id: str):
    """Get user profile"""
    try:
        profile = firebase_service.get_user_profile(user_id)
        
        if not profile:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return UserProfileResponse(
            user_id=user_id,
            name=profile.get("name", ""),
            email=profile.get("email", ""),
            anxiety_type=profile.get("anxietyType", "general"),
            profile_complete=profile.get("profileComplete", False)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ TRIGGER ENDPOINTS ============

@router.post("/user/{user_id}/trigger")
async def add_trigger(user_id: str, trigger_data: TriggerRequest):
    """Add anxiety trigger for user"""
    try:
        success = firebase_service.add_trigger(user_id, {
            "trigger": trigger_data.trigger,
            "frequency": trigger_data.frequency,
            "severity": trigger_data.severity,
            "context": trigger_data.context
        })
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to add trigger"
            )
        
        return {"message": "Trigger added successfully", "user_id": user_id}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/user/{user_id}/triggers")
async def get_user_triggers(user_id: str):
    """Get all triggers for user"""
    try:
        triggers = firebase_service.get_user_triggers(user_id)
        return {"triggers": triggers}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ CHATBOT ENDPOINTS ============

@router.post("/chat", response_model=ChatbotResponse)
async def chat(request: ChatbotRequest):
    """Main chatbot endpoint for user queries"""
    try:
        # Validate anxiety level
        if not 1 <= request.anxiety_level <= 10:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Anxiety level must be between 1 and 10"
            )
        
        # ============ SAFETY CHECK ============
        is_safe, reason = SafetyGuardrail.is_safe_to_respond(request.query)
        
        if not is_safe:
            if reason == "CRISIS_DETECTED":
                # User is in crisis - provide crisis response
                crisis_response = SafetyGuardrail.get_crisis_response()
                conv_id = firebase_service.create_conversation(request.user_id, {
                    "anxietyLevelStart": request.anxiety_level,
                    "anxietyType": request.anxiety_type,
                    "crisis_flagged": True
                }) or str(uuid.uuid4())
                
                # Log crisis detection
                firebase_service.add_message(request.user_id, conv_id, {
                    "role": "system",
                    "text": "CRISIS DETECTED - Emergency resources provided",
                    "type": "crisis_flag"
                })
                
                return ChatbotResponse(
                    conversation_id=conv_id,
                    response_text=crisis_response,
                    audio_url=None,
                    mode=request.mode,
                    timestamp=datetime.utcnow().isoformat()
                )
            
            elif reason == "HARMFUL_INSTRUCTION":
                # User asking bot to provide harmful advice
                harm_response = """
I cannot and will not provide advice on self-harm or suicide methods.

If you're in crisis or having thoughts of self-harm:
🆘 Call 988 (US) or your local crisis line
📱 Text HELLO to 741741
👥 Reach out to someone you trust

I'm here to support you with healthy coping strategies and emotional support. 
Would you like to discuss what's making you feel this way?
"""
                return ChatbotResponse(
                    conversation_id=str(uuid.uuid4()),
                    response_text=harm_response,
                    audio_url=None,
                    mode=request.mode,
                    timestamp=datetime.utcnow().isoformat()
                )
        
        # ============ SAFE TO PROCEED ============
        
        # Create or get conversation
        if request.conversation_id:
            conv_id = request.conversation_id
        else:
            conv_id = firebase_service.create_conversation(request.user_id, {
                "anxietyLevelStart": request.anxiety_level,
                "anxietyType": request.anxiety_type
            })
            # If Firebase not available, generate local ID
            if not conv_id:
                conv_id = str(uuid.uuid4())
        
        # Generate response using RAG pipeline
        response_text = rag_pipeline.generate_response(
            user_query=request.query,
            user_id=request.user_id,
            anxiety_type=request.anxiety_type
        )
        
        # Sanitize response to remove any harmful content
        response_text = SafetyGuardrail.sanitize_response(response_text)
        
        # Handle voice mode
        audio_url = None
        if request.mode == "voice":
            try:
                audio_bytes = tts_service.text_to_speech(response_text)
                if audio_bytes:
                    audio_url = firebase_service.upload_audio(
                        request.user_id,
                        audio_bytes,
                        f"response_{uuid.uuid4()}.mp3"
                    )
            except Exception as e:
                print(f"TTS conversion failed: {e}")
                # Continue with text-only response
        
        # Save interaction to Firebase (if available)
        firebase_service.add_message(request.user_id, conv_id, {
            "role": "user",
            "text": request.query,
            "anxietyLevel": request.anxiety_level
        })
        
        firebase_service.add_message(request.user_id, conv_id, {
            "role": "bot",
            "text": response_text,
            "audioUrl": audio_url,
            "responseType": "rag_response"
        })
        
        return ChatbotResponse(
            conversation_id=conv_id,
            response_text=response_text,
            audio_url=audio_url,
            mode=request.mode,
            timestamp=datetime.now()
        )
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ AFFIRMATION ENDPOINTS ============

@router.post("/affirmation", response_model=AffirmationResponse)
async def get_affirmation(user_id: str, anxiety_type: str = "general", mode: str = "text"):
    """Generate personalized affirmation"""
    try:
        # Generate affirmation
        affirmation = rag_pipeline.generate_affirmation(user_id, anxiety_type)
        
        # Handle voice mode
        audio_url = None
        if mode == "voice":
            try:
                audio_bytes = tts_service.text_to_speech(affirmation)
                if audio_bytes:
                    audio_url = firebase_service.upload_audio(
                        user_id,
                        audio_bytes,
                        f"affirmation_{uuid.uuid4()}.mp3"
                    )
            except Exception as e:
                print(f"TTS conversion failed: {e}")
        
        # Save to Firebase (affirmation history)
        firebase_service.save_personalized_knowledge(user_id, {
            "insightType": "affirmation",
            "content": affirmation,
            "anxietyType": anxiety_type
        })
        
        return AffirmationResponse(
            affirmation=affirmation,
            mode=mode,
            audio_url=audio_url
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ KNOWLEDGE BASE ENDPOINTS ============

@router.get("/knowledge/{category}")
async def get_knowledge(category: str, query: str = None, top_k: int = 5):
    """Get knowledge base content"""
    try:
        if query:
            results = knowledge_base.search(query, category=category, top_k=top_k)
        else:
            results = knowledge_base.get_by_category(category)
        
        return {"category": category, "results": results}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ CONVERSATION ENDPOINTS ============

@router.get("/conversation/{user_id}/{conv_id}")
async def get_conversation(user_id: str, conv_id: str):
    """Get conversation details"""
    try:
        conversation = firebase_service.get_conversation(user_id, conv_id)
        
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found"
            )
        
        return {"conversation_id": conv_id, "data": conversation}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.post("/conversation/{user_id}/{conv_id}/update")
async def update_conversation_feedback(
    user_id: str,
    conv_id: str,
    anxiety_level_end: int = None,
    effectiveness_rating: int = None
):
    """Update conversation with feedback"""
    try:
        updates = {}
        if anxiety_level_end:
            updates["anxietyLevelEnd"] = anxiety_level_end
        if effectiveness_rating:
            updates["effectiveness"] = effectiveness_rating
        
        success = firebase_service.update_conversation(user_id, conv_id, updates)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update conversation"
            )
        
        return {"message": "Conversation updated successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

# ============ CRISIS RESPONSE ENDPOINTS ============

@router.post("/crisis-check")
async def crisis_check(user_id: str, severity: int = 8):
    """Check and respond to crisis-level anxiety"""
    try:
        if severity >= 8:
            crisis_response = rag_pipeline.get_crisis_response(severity)
            
            # Log crisis event
            firebase_service.save_personalized_knowledge(user_id, {
                "insightType": "crisis_event",
                "content": f"Crisis-level anxiety detected (severity: {severity})",
                "severity": severity
            })
            
            return {
                "status": "crisis",
                "message": crisis_response,
                "recommendation": "Please contact a mental health professional"
            }
        else:
            return {
                "status": "manageable",
                "message": "You're managing this well. Keep going!"
            }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
