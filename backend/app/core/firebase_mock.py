"""
Mock Firebase Firestore service for testing (in-memory database)
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class MockFirebaseService:
    """Mock Firestore database service - stores data in memory"""
    
    def __init__(self):
        # In-memory database structure
        self.db_data = {
            "users": {},
            "triggers": {},
            "conversations": {},
            "affirmations": {},
            "assessments": {}
        }
        print("✅ Mock Firebase initialized (in-memory)")
    
    @property
    def db(self):
        """Return self to indicate Firebase is available"""
        return self
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile"""
        return self.db_data["users"].get(user_id)
    
    def create_user_profile(self, user_id: str, user_data: Dict) -> bool:
        """Create new user profile"""
        try:
            self.db_data["users"][user_id] = {
                **user_data,
                "created_at": datetime.now().isoformat()
            }
            print(f"✅ User created: {user_id}")
            return True
        except Exception as e:
            print(f"❌ Error creating user: {e}")
            return False
    
    def add_trigger(self, user_id: str, trigger_data: Dict) -> bool:
        """Add anxiety trigger"""
        try:
            trigger_id = str(uuid.uuid4())
            if user_id not in self.db_data["triggers"]:
                self.db_data["triggers"][user_id] = {}
            
            self.db_data["triggers"][user_id][trigger_id] = {
                **trigger_data,
                "created_at": datetime.now().isoformat()
            }
            return True
        except Exception as e:
            print(f"❌ Error adding trigger: {e}")
            return False
    
    def get_user_triggers(self, user_id: str) -> List[Dict]:
        """Get user's anxiety triggers"""
        try:
            triggers = self.db_data["triggers"].get(user_id, {})
            return list(triggers.values())
        except Exception as e:
            print(f"❌ Error getting triggers: {e}")
            return []
    
    def create_conversation(self, user_id: str, conv_data: Dict) -> Optional[str]:
        """Create new conversation"""
        try:
            conv_id = str(uuid.uuid4())
            if user_id not in self.db_data["conversations"]:
                self.db_data["conversations"][user_id] = {}
            
            self.db_data["conversations"][user_id][conv_id] = {
                **conv_data,
                "messages": [],
                "created_at": datetime.now().isoformat()
            }
            return conv_id
        except Exception as e:
            print(f"❌ Error creating conversation: {e}")
            return None
    
    def add_message(self, user_id: str, conv_id: str, message: Dict) -> bool:
        """Add message to conversation"""
        try:
            if user_id in self.db_data["conversations"]:
                if conv_id in self.db_data["conversations"][user_id]:
                    self.db_data["conversations"][user_id][conv_id]["messages"].append({
                        **message,
                        "timestamp": datetime.now().isoformat()
                    })
                    return True
            return False
        except Exception as e:
            print(f"❌ Error adding message: {e}")
            return False
    
    def get_conversation(self, user_id: str, conv_id: str) -> Optional[Dict]:
        """Get conversation details"""
        try:
            if user_id in self.db_data["conversations"]:
                return self.db_data["conversations"][user_id].get(conv_id)
            return None
        except Exception as e:
            print(f"❌ Error getting conversation: {e}")
            return None
    
    def get_user_context(self, user_id: str) -> Dict:
        """Get user context for personalization"""
        try:
            user_data = self.get_user_profile(user_id)
            triggers = self.get_user_triggers(user_id)
            
            return {
                "profile": user_data,
                "triggers": triggers,
                "knowledge": []
            }
        except Exception as e:
            print(f"❌ Error getting user context: {e}")
            return {}
    
    def upload_audio(self, user_id: str, audio_bytes: bytes, filename: str) -> Optional[str]:
        """Mock audio upload - just return a URL"""
        try:
            url = f"/mock-audio/{user_id}/{filename}"
            return url
        except Exception as e:
            print(f"❌ Error uploading audio: {e}")
            return None
    
    def save_personalized_knowledge(self, user_id: str, knowledge_data: Dict) -> bool:
        """Save personalized knowledge"""
        try:
            if user_id not in self.db_data["affirmations"]:
                self.db_data["affirmations"][user_id] = []
            
            self.db_data["affirmations"][user_id].append(knowledge_data)
            return True
        except Exception as e:
            print(f"❌ Error saving knowledge: {e}")
            return False


# Create global mock Firebase instance
firebase_service = MockFirebaseService()
