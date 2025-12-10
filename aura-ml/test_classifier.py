"""
Manual Verification Script: Audio Classification.

A standalone utility for validating the `/classify-audio` endpoint.
Ensures the AST (Audio Spectrogram Transformer) pipeline correctly processes 
a remote audio URL and returns standardized "Aura Vibe" labels.
"""

import requests
import json

# Publicly accessible test file for validation
TEST_FILE_URL = "https://mfathybxqwqvngpknxzo.supabase.co/storage/v1/object/public/sounds/rain.mp3" 

url = "http://127.0.0.1:8000/classify-audio"
payload = {"file_url": TEST_FILE_URL}
headers = {"Content-Type": "application/json"}

print(f"Testing with URL: {TEST_FILE_URL}")
try:
    response = requests.post(url, json=payload, headers=headers)
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Connection Error: {e}")