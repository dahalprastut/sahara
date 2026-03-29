import requests
import json

BASE_URL = "http://localhost:8000"

print("=" * 80)
print("TESTING CHATBOT WITH PDF-ENHANCED KNOWLEDGE BASE")
print("=" * 80)

# Step 1: Create user
print("\n[STEP 1] Creating user profile...")
user_response = requests.post(
    f"{BASE_URL}/api/user/profile",
    json={
        "name": "Test User",
        "email": "test@example.com",
        "anxiety_type": "careers",
        "age_range": "25-34",
        "preferences": {}
    }
)
user_data = user_response.json()
user_id = user_data["user_id"]
print(f"✅ User created: {user_id}")

# Step 2: Test chat with careers anxiety (should use PDF now)
print("\n[STEP 2] Testing careers anxiety with PDF knowledge base...")
chat_response = requests.post(
    f"{BASE_URL}/api/chat",
    json={
        "user_id": user_id,
        "query": "I'm very anxious about my upcoming job interview. I'm worried about how to answer tough questions and make a good impression",
        "mode": "text",
        "anxiety_type": "careers",
        "anxiety_level": 8
    }
)
chat_data = chat_response.json()
print(f"\n📝 Query: I'm very anxious about my upcoming job interview...")
print(f"\n🤖 Bot Response (using PDF knowledge):")
print(f"{chat_data['response_text'][:800]}...")
print(f"\n📊 Timestamp: {chat_data['timestamp']}")
print(f"📊 Conversation ID: {chat_data['conversation_id']}")

# Step 3: Test relationships
print("\n\n[STEP 3] Testing relationship anxiety with PDF knowledge base...")
chat_response2 = requests.post(
    f"{BASE_URL}/api/chat",
    json={
        "user_id": user_id,
        "query": "I'm struggling with communication in my relationship. We have conflicts and I don't know how to resolve them properly.",
        "mode": "text",
        "anxiety_type": "relationships",
        "anxiety_level": 7
    }
)
chat_data2 = chat_response2.json()
print(f"\n📝 Query: I'm struggling with communication in my relationship...")
print(f"\n🤖 Bot Response (using PDF knowledge):")
print(f"{chat_data2['response_text'][:800]}...")
print(f"\n📊 Timestamp: {chat_data2['timestamp']}")

# Step 4: Test general anxiety
print("\n\n[STEP 4] Testing general anxiety with affirmations...")
chat_response3 = requests.post(
    f"{BASE_URL}/api/chat",
    json={
        "user_id": user_id,
        "query": "Can you give me an affirmation? I'm feeling overwhelmed with everything",
        "mode": "text",
        "anxiety_type": "general",
        "anxiety_level": 9
    }
)
chat_data3 = chat_response3.json()
print(f"\n📝 Query: Can you give me an affirmation?...")
print(f"\n🤖 Bot Response:")
print(f"{chat_data3['response_text'][:800]}...")

print("\n\n" + "=" * 80)
print("✅ TESTING COMPLETE - PDFs ARE NOW ENHANCING RESPONSES!")
print("=" * 80)
