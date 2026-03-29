#!/usr/bin/env python3
"""Get full chatbot response"""

import requests
import json

payload = {
    'user_id': 'demo_user_123',
    'query': 'I am feeling very anxious about speaking in public at an important work meeting',
    'mode': 'text',
    'anxiety_type': 'careers',
    'anxiety_level': 8
}

print("Testing Anxiety Intervention Chatbot...")
print("=" * 80)

resp = requests.post('http://localhost:8000/api/chat', json=payload, timeout=120)
data = resp.json()

print(f"\n🔹 Your Query: {payload['query']}")
print(f"🔹 Anxiety Level: {payload['anxiety_level']}/10")
print(f"🔹 Anxiety Type: {payload['anxiety_type']}\n")

print("🤖 CHATBOT RESPONSE:")
print("-" * 80)
print(data['response_text'])
print("-" * 80)

print(f"\n✅ Status: Success")
print(f"📝 Conversation ID: {data['conversation_id']}")
print(f"🎙️  Mode: {data['mode']}")
