"""
Pydantic settings for configuration management
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings from environment variables"""
    
    # App info
    app_name: str = "Anxiety Intervention Chatbot"
    app_version: str = "1.0.0"
    
    # Firebase
    firebase_project_id: str = "anxiety-chatbot-app"
    firebase_api_key: Optional[str] = None
    firebase_service_account_key_path: Optional[str] = None
    
    # Ollama LLM
    ollama_base_url: str = "http://localhost:11434"
    ollama_model: str = "llama3:8b"
    
    # API
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    api_debug: bool = True
    
    # Logging
    log_level: str = "INFO"
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()
