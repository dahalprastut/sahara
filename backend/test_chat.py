#!/usr/bin/env python3
"""Simple chatbot test script"""

import requests
import json
import sys

API_URL = "http://localhost:8000/api/chat"

queries = [
    ("I'm nervous about a job interview tomorrow", "careers", 8),
    ("I'm struggling with social anxiety", "relationships", 6),
    ("Can you give me an affirmation?", "general", 5),
]

for query, anxiety_type, level in queries:
    print(f"\n{'='*70}")
    print(f"Query: {query}")
    print(f"Anxiety Type: {anxiety_type}, Level: {level}")
    print('='*70)
    
    payload = {
        "user_id": f"test_{anxiety_type}_{level}",
        "query": query,
        "mode": "text",
        "anxiety_type": anxiety_type,
        "anxiety_level": level
    }
    
    try:
        response = requests.post(API_URL, json=payload, timeout=120)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Response received:")
            print(f"   Bot: {data['response_text'][:200]}...")
            print(f"   Conversation ID: {data['conversation_id']}")
        else:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

print("\n" + "="*70)
print("✅ All tests completed!")
