import pyttsx3
from typing import Optional
import io
import os

class TTSService:
    """Text-to-Speech Service using pyttsx3 (local, no external API)"""
    
    def __init__(self):
        self.engine = None
        self._initialized = False
    
    def _ensure_initialized(self):
        """Lazy initialize the TTS engine"""
        if not self._initialized:
            try:
                self.engine = pyttsx3.init()
                self.engine.setProperty('rate', 150)  # Speed
                self.engine.setProperty('volume', 0.9)  # Volume
                self._initialized = True
            except Exception as e:
                print(f"⚠️  TTS initialization failed: {e}")
                self.engine = None
                self._initialized = True
    
    def text_to_speech(self, text: str, output_file: str = None) -> Optional[bytes]:
        """Convert text to speech
        
        Args:
            text: Text to convert
            output_file: Optional file path to save audio
            
        Returns:
            bytes of audio file or None if using file output
        """
        try:
            self._ensure_initialized()
            
            if not self.engine:
                return None
            
            if output_file:
                self.engine.save_to_file(text, output_file)
                self.engine.runAndWait()
                
                # Read the file back as bytes
                with open(output_file, 'rb') as f:
                    audio_data = f.read()
                return audio_data
            else:
                # Generate in memory
                temp_file = '/tmp/temp_audio.mp3'
                self.engine.save_to_file(text, temp_file)
                self.engine.runAndWait()
                
                with open(temp_file, 'rb') as f:
                    audio_data = f.read()
                
                # Clean up
                if os.path.exists(temp_file):
                    os.remove(temp_file)
                
                return audio_data
                
        except Exception as e:
            print(f"Error converting text to speech: {e}")
            return None
    
    def set_voice(self, voice_id: int = 0):
        """Set voice (0=male, 1=female)"""
        try:
            self._ensure_initialized()
            
            if not self.engine:
                return
            
            voices = self.engine.getProperty('voices')
            if voice_id < len(voices):
                self.engine.setProperty('voice', voices[voice_id].id)
        except Exception as e:
            print(f"Error setting voice: {e}")

tts_service = TTSService()
