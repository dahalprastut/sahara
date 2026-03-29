"""
Firebase Firestore service for database operations
"""

from typing import Optional, List, Dict, Any
from config.settings import settings

try:
    import firebase_admin
    from firebase_admin import credentials, firestore
    FIREBASE_AVAILABLE = True
except ImportError:
    FIREBASE_AVAILABLE = False

# Import mock Firebase as fallback
from app.core.firebase_mock import MockFirebaseService as FirebaseServiceImpl

# Global mock instance (singleton for persistence)
_mock_firebase_instance = None

def get_mock_firebase():
    """Get or create singleton mock Firebase instance"""
    global _mock_firebase_instance
    if _mock_firebase_instance is None:
        _mock_firebase_instance = FirebaseServiceImpl()
    return _mock_firebase_instance


class FirebaseService:
    """Firebase Firestore database service with mock fallback"""
    
    def __init__(self):
        self.db = None
        self._use_mock = False
        self._initialize()
    
    def _initialize(self):
        """Initialize Firebase connection (with mock fallback)"""
        try:
            if not FIREBASE_AVAILABLE:
                print("⚠️  Firebase SDK not available - using mock")
                self._use_mock = True
                return
            
            if settings.firebase_service_account_key_path:
                try:
                    cred = credentials.Certificate(settings.firebase_service_account_key_path)
                    firebase_admin.initialize_app(cred)
                    self.db = firestore.client()
                    print("✅ Firebase connected successfully")
                    return
                except Exception as auth_error:
                    print(f"⚠️  Firebase auth failed: {auth_error}")
                    print("   Falling back to mock Firebase for testing...")
                    self._use_mock = True
            else:
                print("⚠️  Firebase credentials not configured - using mock")
                self._use_mock = True
        except Exception as e:
            print(f"❌ Firebase initialization error: {e}")
            self._use_mock = True
    
    def _get_mock_service(self):
        """Get mock service instance if in mock mode"""
        if self._use_mock:
            return get_mock_firebase()
        return None
    
    def get_user_profile(self, user_id: str) -> Optional[Dict]:
        """Get user profile from Firestore or mock"""
        try:
            if self._use_mock:
                return self._get_mock_service().get_user_profile(user_id)
            if not self.db:
                return None
            doc = self.db.collection('users').document(user_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting user profile: {e}")
            return None
    
    def create_user_profile(self, user_id: str, user_data: Dict) -> bool:
        """Create new user profile"""
        try:
            if self._use_mock:
                return self._get_mock_service().create_user_profile(user_id, user_data)
            if not self.db:
                return False
            self.db.collection('users').document(user_id).set(user_data)
            return True
        except Exception as e:
            print(f"Error creating user profile: {e}")
            return False
    
    def add_trigger(self, user_id: str, trigger_data: Dict) -> bool:
        """Add anxiety trigger"""
        try:
            if self._use_mock:
                return self._get_mock_service().add_trigger(user_id, trigger_data)
            if not self.db:
                return False
            self.db.collection('users').document(user_id).collection('triggers').add(trigger_data)
            return True
        except Exception as e:
            print(f"Error adding trigger: {e}")
            return False
    
    def get_user_triggers(self, user_id: str) -> List[Dict]:
        """Get user's anxiety triggers"""
        try:
            if self._use_mock:
                return self._get_mock_service().get_user_triggers(user_id)
            if not self.db:
                return []
            docs = self.db.collection('users').document(user_id).collection('triggers').stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            print(f"Error getting triggers: {e}")
            return []
    
    def create_conversation(self, user_id: str, conv_data: Dict) -> Optional[str]:
        """Create new conversation"""
        try:
            if self._use_mock:
                return self._get_mock_service().create_conversation(user_id, conv_data)
            if not self.db:
                return None
            ref = self.db.collection('users').document(user_id).collection('conversations').add(conv_data)
            return ref[1].id
        except Exception as e:
            print(f"Error creating conversation: {e}")
            return None
    
    def add_message(self, user_id: str, conv_id: str, message: Dict) -> bool:
        """Add message to conversation"""
        try:
            if self._use_mock:
                return self._get_mock_service().add_message(user_id, conv_id, message)
            if not self.db:
                return False
            self.db.collection('users').document(user_id).collection('conversations')\
                .document(conv_id).collection('messages').add(message)
            return True
        except Exception as e:
            print(f"Error adding message: {e}")
            return False
    
    def get_conversation(self, user_id: str, conv_id: str) -> Optional[Dict]:
        """Get conversation details"""
        try:
            if self._use_mock:
                return self._get_mock_service().get_conversation(user_id, conv_id)
            if not self.db:
                return None
            doc = self.db.collection('users').document(user_id).collection('conversations')\
                .document(conv_id).get()
            return doc.to_dict() if doc.exists else None
        except Exception as e:
            print(f"Error getting conversation: {e}")
            return None
    
    def get_user_context(self, user_id: str) -> Dict:
        """Get user context for personalization"""
        try:
            if self._use_mock:
                return self._get_mock_service().get_user_context(user_id)
            if not self.db:
                return {}
            
            user_data = self.get_user_profile(user_id)
            triggers = self.get_user_triggers(user_id)
            
            return {
                "profile": user_data,
                "triggers": triggers,
                "knowledge": []
            }
        except Exception as e:
            print(f"Error getting user context: {e}")
            return {}

# Create global service instance  
firebase_service = FirebaseService()

# If using mock, replace with the singleton instance
if firebase_service._use_mock:
    # Create a wrapper that delegates to the persistent mock
    class MockFirebaseWrapper:
        def __init__(self, mock_instance):
            self.mock = mock_instance
            self.db = mock_instance  # For compatibility checks
            self._use_mock = True
        
        def __getattr__(self, name):
            return getattr(self.mock, name)
    
    firebase_service = MockFirebaseWrapper(get_mock_firebase())

