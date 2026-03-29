import requests
from config.settings import settings
from typing import Optional, List
import json

class OllamaService:
    """Ollama LLM Service for local LLM inference"""
    
    def __init__(self):
        self.base_url = settings.ollama_base_url
        self.model = settings.ollama_model
        self.headers = {"Content-Type": "application/json"}
    
    def check_health(self) -> bool:
        """Check if Ollama is running"""
        try:
            response = requests.get(f"{self.base_url}/api/tags", timeout=5)
            return response.status_code == 200
        except Exception as e:
            print(f"❌ Ollama health check failed: {e}")
            return False
    
    def generate_response(self, prompt: str, temperature: float = 0.7) -> Optional[str]:
        """Generate response using Ollama"""
        try:
            payload = {
                "model": self.model,
                "prompt": prompt,
                "temperature": temperature,
                "stream": False
            }
            
            response = requests.post(
                f"{self.base_url}/api/generate",
                json=payload,
                headers=self.headers,
                timeout=60
            )
            
            if response.status_code == 200:
                result = response.json()
                return result.get('response', '').strip()
            else:
                print(f"Ollama error: {response.status_code}")
                return None
        except Exception as e:
            print(f"Error generating response: {e}")
            return None
    
    def generate_with_context(self, 
                            user_query: str, 
                            context: str, 
                            system_prompt: str = "") -> Optional[str]:
        """Generate response with provided context (for RAG)"""
        try:
            full_prompt = f"""System: {system_prompt}

Context:
{context}

User Query: {user_query}

Response:"""
            
            return self.generate_response(full_prompt)
        except Exception as e:
            print(f"Error generating context-aware response: {e}")
            return None
    
    def generate_affirmation(self, anxiety_type: str, user_context: str = "") -> Optional[str]:
        """Generate personalized affirmation"""
        system_prompt = f"You are a compassionate mental health support assistant specializing in {anxiety_type} anxiety. Generate a supportive, personalized affirmation."
        
        prompt = f"""Generate a single powerful affirmation for someone experiencing {anxiety_type} anxiety.
{f'User context: {user_context}' if user_context else ''}
The affirmation should be:
- Empowering and realistic
- Specific to {anxiety_type} anxiety
- Short (1-2 sentences)
- Encouraging without being dismissive

Affirmation:"""
        
        return self.generate_response(prompt, temperature=0.5)

ollama_service = OllamaService()
