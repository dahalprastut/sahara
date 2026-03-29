from langchain_ollama import OllamaLLM
from app.core.firebase import firebase_service
from app.knowledge_base.synthetic_data import KnowledgeBase
from config.settings import settings
from typing import Optional, List, Dict
import json

class RAGPipeline:
    """Retrieval-Augmented Generation Pipeline"""
    
    def __init__(self):
        self.llm = OllamaLLM(
            model=settings.ollama_model,
            base_url=settings.ollama_base_url,
            temperature=0.7
        )
        self.knowledge_base = KnowledgeBase()
    
    def retrieve_relevant_knowledge(self, 
                                   query: str, 
                                   category: str = "general",
                                   top_k: int = 3) -> List[str]:
        """Retrieve relevant knowledge from synthetic dataset"""
        
        relevant_docs = self.knowledge_base.search(
            query=query,
            category=category,
            top_k=top_k
        )
        return relevant_docs
    
    def generate_response(self,
                         user_query: str,
                         user_id: str = None,
                         anxiety_type: str = "general") -> str:
        """Generate response using RAG pipeline"""
        
        # 1. Retrieve relevant knowledge
        relevant_knowledge = self.retrieve_relevant_knowledge(
            user_query,
            category=anxiety_type
        )
        
        # 2. Get user context for personalization
        user_context = ""
        if user_id:
            context_data = firebase_service.get_user_context(user_id)
            if context_data.get('knowledge'):
                user_context = "\n".join([
                    f"- {k.get('content', '')}"
                    for k in context_data.get('knowledge', [])[:3]
                ])
        
        # 3. Build context
        context = f"""
Educational Content:
{json.dumps(relevant_knowledge[:2], indent=2)}

User History:
{user_context if user_context else "No previous context"}
"""
        
        # 4. Create prompt
        prompt = f"""You are a compassionate mental health support specialist.

Context Information:
{context}

User's anxiety type: {anxiety_type}
User's Query: {user_query}

Provide a supportive, empathetic response that:
1. Acknowledges their feelings
2. Provides practical advice based on the context
3. Is personalized to their anxiety type
4. Is encouraging but realistic (1-3 sentences)

Response:"""
        
        # 5. Generate response using LLM directly
        try:
            response = self.llm.invoke(prompt)
            response_text = response.strip() if response else "I'm here to support you. Please try again."
            
            # Add safety disclaimer
            safety_disclaimer = "\n\n⚠️ **Important:** I'm an AI chatbot, not a licensed therapist. If you're struggling with serious anxiety or depression, please reach out to a mental health professional or crisis line (988 in US)."
            
            return response_text + safety_disclaimer
        except Exception as e:
            print(f"Error generating response: {e}")
            return "I'm here to support you. Please try again."
    
    def generate_affirmation(self, user_id: str, anxiety_type: str) -> str:
        """Generate personalized affirmation"""
        
        user_context = firebase_service.get_user_context(user_id) if user_id else {}
        
        # Retrieve affirmation-related knowledge
        affirmation_content = self.retrieve_relevant_knowledge(
            f"positive affirmation for {anxiety_type}",
            category="affirmations",
            top_k=2
        )
        
        affirmation_prompt = f"""Generate a single powerful, personalized affirmation for someone experiencing {anxiety_type} anxiety.

Context:
{json.dumps(affirmation_content, indent=2)}

Requirements:
- 1-2 sentences maximum
- Empowering and realistic
- Specific to {anxiety_type}
- Warm and supportive tone

Affirmation:"""
        
        try:
            response = self.llm.invoke(affirmation_prompt)
            return response.strip() if response else "You are stronger than you think."
        except Exception as e:
            print(f"Error generating affirmation: {e}")
            return "You are stronger than you think."
    
    def get_crisis_response(self, severity: int = 8) -> str:
        """Get crisis intervention response"""
        
        if severity >= 8:
            return "I hear that you're going through a really difficult time right now. Your feelings are valid. Please reach out to a mental health professional or call a crisis helpline if you need immediate support. You're not alone in this. 💙"
        else:
            return "You're experiencing significant anxiety. Let's take this one step at a time. Would you like to try a grounding technique or talk through what's on your mind?"

rag_pipeline = RAGPipeline()
