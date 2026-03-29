"""
Safety guardrails for anxiety chatbot
Prevents harmful responses and detects crisis situations
"""

CRISIS_KEYWORDS = [
    "suicide", "suicidal", "kill myself", "harm myself", "end my life",
    "overdose", "cut myself", "self harm", "self-harm", "jumping", "hang",
    "noose", "poison", "bleed", "hurt myself", "i want to die",
    "i'm going to die", "i cannot live", "no point in living",
    "better off dead", "everyone would be better off without me"
]

HARMFUL_ENCOURAGEMENT_KEYWORDS = [
    "encourage suicide", "promote self harm", "suggest overdose",
    "recommend cutting", "advice on hanging", "how to kill yourself"
]

CRISIS_RESOURCES = {
    "US": {
        "name": "988 Suicide & Crisis Lifeline",
        "number": "988",
        "text": "Text HOME to 741741",
        "url": "https://988lifeline.org"
    },
    "UK": {
        "name": "Samaritans",
        "number": "116 123",
        "url": "https://www.samaritans.org.uk"
    },
    "CANADA": {
        "name": "Crisis Text Line Canada",
        "text": "Text HELLO to 741741",
        "url": "https://www.crisistext.org"
    },
    "INTERNATIONAL": {
        "url": "https://findahelpline.com"
    }
}

class SafetyGuardrail:
    """Safety system to prevent harmful responses"""
    
    @staticmethod
    def detect_crisis(text: str) -> bool:
        """Detect if user is in crisis"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in CRISIS_KEYWORDS)
    
    @staticmethod
    def has_harmful_instruction(text: str) -> bool:
        """Check if request asks bot to provide harmful advice"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in HARMFUL_ENCOURAGEMENT_KEYWORDS)
    
    @staticmethod
    def get_crisis_response() -> str:
        """Generate appropriate crisis response"""
        return """
🆘 I notice you may be in crisis, and I want you to know that you're not alone.

**PLEASE REACH OUT FOR IMMEDIATE HELP:**

🇺🇸 **United States:**
- Call or text **988** (Suicide & Crisis Lifeline) - Available 24/7
- Text HOME to 741741 (Crisis Text Line)
- Go to nearest Emergency Room
- Call 911 if you're in immediate danger

🇬🇧 **United Kingdom:**
- Call **116 123** (Samaritans)
- Visit: https://www.samaritans.org.uk

🇨🇦 **Canada:**
- Text HELLO to 741741 (Crisis Text Line Canada)
- Call 1-833-456-4566

**International:**
- Visit: https://findahelpline.com for resources in your country

**Important reminders:**
- Your life has value and meaning
- This feeling is temporary, even if it doesn't feel that way now
- People who have felt like this have survived and found reasons to live
- Professional help WORKS

Please reach out to one of these services right now. They have trained counselors 
who can help you through this crisis. You deserve support from professionals trained 
in crisis intervention. I'm here to chat, but trained professionals are better equipped 
to help you right now.
"""
    
    @staticmethod
    def sanitize_response(response: str) -> str:
        """Remove any harmful content from bot response"""
        harmful_phrases = [
            "you should end your life",
            "you could hurt yourself",
            "ways to self harm",
            "methods of suicide",
            "how to overdose",
            "techniques for cutting",
            "ways to poison yourself"
        ]
        
        response_lower = response.lower()
        for phrase in harmful_phrases:
            if phrase in response_lower:
                return """
I notice my response contained inappropriate content. 

Instead, I want to remind you: You deserve support and care. If you're struggling, 
please reach out to a mental health professional or crisis line. Your life matters.
"""
        
        return response
    
    @staticmethod
    def is_safe_to_respond(query: str) -> tuple[bool, str]:
        """
        Check if it's safe to respond to query
        Returns: (is_safe: bool, reason: str)
        """
        
        # Check for crisis
        if SafetyGuardrail.detect_crisis(query):
            return False, "CRISIS_DETECTED"
        
        # Check for harmful instructions
        if SafetyGuardrail.has_harmful_instruction(query):
            return False, "HARMFUL_INSTRUCTION"
        
        return True, "SAFE"

# Safety-approved knowledge guidelines
SAFETY_KNOWLEDGE_GUIDELINES = """
ALLOWED CONTENT:
✅ Coping strategies and stress management techniques
✅ Communication skills and healthy relationships
✅ Career development and professional growth
✅ Anxiety management techniques (breathing, grounding, mindfulness)
✅ Self-compassion and positive affirmations
✅ When to seek professional mental health support
✅ Resources for mental health services
✅ Building social connections and support networks
✅ Sleep hygiene, exercise, nutrition for mental health
✅ Cognitive behavioral therapy (CBT) principles
✅ Mindfulness and meditation techniques

PROHIBITED CONTENT:
❌ Methods of self-harm
❌ Ways to commit suicide
❌ Encouragement of harmful behaviors
❌ Dismissal of mental health concerns
❌ Replacing professional help with chatbot advice
❌ Risky coping mechanisms (substance abuse, etc.)
❌ Toxic positivity ("just think positive, get over it")
❌ Medical advice (diagnosing conditions, prescribing)
❌ Encouragement to isolate from support systems
❌ Normalization of dangerous behaviors

MANDATORY DISCLAIMERS:
- "I'm an AI chatbot, not a licensed therapist"
- "For serious concerns, please contact a mental health professional"
- "If you're in crisis, call 988 (US) or your local crisis line"
"""
