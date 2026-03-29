from typing import List, Dict
import json
from difflib import SequenceMatcher

# Try to import PDF documents if available
try:
    from app.knowledge_base.pdf_documents import PDF_CAREERS, PDF_RELATIONSHIPS
except ImportError:
    PDF_CAREERS = []
    PDF_RELATIONSHIPS = []

class KnowledgeBase:
    """Synthetic knowledge base for careers and relationships"""
    
    def __init__(self):
        self.data = self._initialize_data()
    
    def _initialize_data(self) -> Dict[str, List[Dict]]:
        """Initialize synthetic dataset"""
        
        data = {
            "careers": [
                {
                    "id": "career_1",
                    "title": "Job Interview Anxiety",
                    "content": "Job interviews trigger anxiety for many people. Remember: the interviewer wants you to succeed. They're just trying to find the right fit. You've already proven your skills by getting the interview. Focus on your strengths and be authentic.",
                    "category": "careers",
                    "type": "advice"
                },
                {
                    "id": "career_2",
                    "title": "Understanding Career Transitions",
                    "content": "Career changes are common and normal. Feeling uncertain about a new job or career path is part of the process. Give yourself time to adjust. Small wins add up. You're building new skills every day.",
                    "category": "careers",
                    "type": "perspective"
                },
                {
                    "id": "career_3",
                    "title": "Imposter Syndrome in Workplace",
                    "content": "Feeling like you don't deserve your position? That's imposter syndrome. Most successful people feel this way. Your achievements are real. You were hired for a reason. Trust your abilities and give yourself credit.",
                    "category": "careers",
                    "type": "reassurance"
                },
                {
                    "id": "career_4",
                    "title": "Work-Life Balance Strategies",
                    "content": "Anxiety about work-life balance is valid. Set boundaries: specific work hours, no emails after work, dedicated personal time. Your wellbeing fuels your work performance. Taking care of yourself is not selfish, it's essential.",
                    "category": "careers",
                    "type": "coping_strategy"
                },
                {
                    "id": "career_5",
                    "title": "Public Speaking at Work",
                    "content": "Nervous about presentations? That's completely normal. Practice your material out loud. Remember: your audience wants you to succeed. You have valuable insights to share. Start with friendly faces in the room.",
                    "category": "careers",
                    "type": "technique"
                }
            ],
            "relationships": [
                {
                    "id": "rel_1",
                    "title": "Social Anxiety in Relationships",
                    "content": "Worrying about what others think? Remember: most people are too focused on themselves to judge you. Vulnerability is strength. Real connections happen when you're authentic. Start by connecting with one person at a time.",
                    "category": "relationships",
                    "type": "advice"
                },
                {
                    "id": "rel_2",
                    "title": "Conflict Resolution in Relationships",
                    "content": "Conflict doesn't mean the relationship is failing. Healthy disagreements strengthen bonds. Express your feelings without blame. Listen actively. Most conflicts are solvable when both people care.",
                    "category": "relationships",
                    "type": "perspective"
                },
                {
                    "id": "rel_3",
                    "title": "Loneliness and Connection",
                    "content": "Feeling alone? Humans are wired for connection. Reaching out is brave. Small interactions matter. A conversation with a friend, family member, or even a chat with a stranger at a café can brighten your day.",
                    "category": "relationships",
                    "type": "reassurance"
                },
                {
                    "id": "rel_4",
                    "title": "Setting Boundaries",
                    "content": "Saying 'no' is okay. Boundaries protect your peace. You can care about someone AND have boundaries. Clear boundaries actually strengthen relationships. Your needs are valid.",
                    "category": "relationships",
                    "type": "coping_strategy"
                },
                {
                    "id": "rel_5",
                    "title": "Dating Anxiety",
                    "content": "Nervous about dating? That means you care about making a good impression. But remember: the right person will appreciate the real you. Be yourself. Chemistry is mutual. Rejection isn't failure, it's just incompatibility.",
                    "category": "relationships",
                    "type": "technique"
                }
            ],
            "affirmations": [
                {
                    "id": "aff_1",
                    "content": "You are capable of handling whatever comes your way.",
                    "category": "affirmations",
                    "type": "empowerment"
                },
                {
                    "id": "aff_2",
                    "content": "Your worth is not determined by your productivity or performance.",
                    "category": "affirmations",
                    "type": "self_worth"
                },
                {
                    "id": "aff_3",
                    "content": "This anxiety is temporary, and you will get through it.",
                    "category": "affirmations",
                    "type": "hope"
                },
                {
                    "id": "aff_4",
                    "content": "You deserve kindness, especially from yourself.",
                    "category": "affirmations",
                    "type": "self_compassion"
                },
                {
                    "id": "aff_5",
                    "content": "Small progress is still progress. You're moving in the right direction.",
                    "category": "affirmations",
                    "type": "encouragement"
                }
            ],
            "coping_techniques": [
                {
                    "id": "tech_1",
                    "title": "4-7-8 Breathing",
                    "content": "Breathe in for 4 counts, hold for 7, exhale for 8. This calms your nervous system instantly. Repeat 4 times.",
                    "category": "coping_techniques",
                    "type": "breathing"
                },
                {
                    "id": "tech_2",
                    "title": "Grounding 5-4-3-2-1",
                    "content": "Notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste. This brings you back to the present moment.",
                    "category": "coping_techniques",
                    "type": "grounding"
                }
            ]
        }
        
        # Add PDF documents if available
        if PDF_CAREERS:
            data["careers"].extend(PDF_CAREERS)
        if PDF_RELATIONSHIPS:
            data["relationships"].extend(PDF_RELATIONSHIPS)
        
        return data
    
    def search(self, query: str, category: str = "general", top_k: int = 3) -> List[Dict]:
        """Search knowledge base using simple similarity matching"""
        
        query_lower = query.lower()
        results = []
        
        # Determine which collections to search
        if category == "general":
            search_collections = self.data.values()
        else:
            search_collections = [self.data.get(category, [])]
        
        # Score all documents
        for collection in search_collections:
            for doc in collection:
                # Simple similarity score
                content = f"{doc.get('title', '')} {doc.get('content', '')}".lower()
                score = self._similarity_score(query_lower, content)
                
                if score > 0:
                    results.append({
                        **doc,
                        'score': score
                    })
        
        # Sort by score and return top-k
        results.sort(key=lambda x: x['score'], reverse=True)
        return results[:top_k]
    
    def _similarity_score(self, query: str, text: str) -> float:
        """Calculate similarity score between query and text"""
        
        # Split into words
        query_words = query.split()
        text_lower = text.lower()
        
        # Count matching words
        matches = sum(1 for word in query_words if word in text_lower)
        
        # Return score (0-1)
        return matches / len(query_words) if query_words else 0
    
    def get_by_category(self, category: str) -> List[Dict]:
        """Get all documents by category"""
        return self.data.get(category, [])
    
    def add_custom_knowledge(self, category: str, knowledge_item: Dict) -> bool:
        """Add custom knowledge item (for user-specific learning)"""
        try:
            if category not in self.data:
                self.data[category] = []
            self.data[category].append(knowledge_item)
            return True
        except Exception as e:
            print(f"Error adding custom knowledge: {e}")
            return False

# Initialize knowledge base
knowledge_base = KnowledgeBase()
