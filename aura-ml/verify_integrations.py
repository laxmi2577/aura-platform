"""
Integration Smoke Test Suite.

A comprehensive verification script to validate the health and interconnectivity 
of all primary microservices.
Tests coverage includes:
1. System Health (Heartbeat)
2. Semantic Search (Vector retrieval)
3. Vision Analysis (Face DJ mock)
4. Generative Logic (Surprise Me)
5. RAG Pipeline (Coach knowledge retrieval)
"""

import requests
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path="d:/PROJ/aura-ml/.env")
API_KEY = os.getenv("AURA_API_KEY", "aura-secret-key-2025")
BASE_URL = "http://127.0.0.1:8000"

print(f"🔑 Using Key: {API_KEY}")

def test_endpoint(name, url, payload=None):
    headers = {"x-api-key": API_KEY, "Content-Type": "application/json"}
    try:
        if payload:
            response = requests.post(url, json=payload, headers=headers)
        else:
            response = requests.get(url, headers=headers)
        
        if response.status_code == 200:
            print(f"✅ {name}: SUCCESS")
        elif response.status_code == 403:
            print(f"❌ {name}: FORBIDDEN (Key Invalid)")
        else:
            print(f"⚠️ {name}: {response.status_code} - {response.text}")
    except Exception as e:
        print(f"❌ {name}: FAILED ({e})")

# 1. Health
test_endpoint("System Health", f"{BASE_URL}/")

# 2. Search
test_endpoint("Search Sounds", f"{BASE_URL}/search", {"query": "rain", "match_count": 1})

# 3. Face DJ Mock
test_endpoint("Face DJ (Mock)", f"{BASE_URL}/analyze-face", {"image": "mock_base64"})

# 4. Surprise Me (Mix)
test_endpoint("Surprise Me", f"{BASE_URL}/generate-mix", {"scenario": "focus"})

# 5. Connect (Coach Search)
test_endpoint("Coach Search", f"{BASE_URL}/search-knowledge", {"query": "sleep science"})
