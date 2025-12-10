"""
Manual Verification Script: Custom CNN.

Validates the end-to-end inference pipeline for the dedicated PyTorch CNN.
Checks for correct model loading, preprocessing (resampling/spectrogram generation), 
and successful classification against UrbanSound8K classes.
"""

import requests
import json

TEST_URL = "https://mfathybxqwqvngpknxzo.supabase.co/storage/v1/object/public/sounds/rain.mp3" 

print(f"1. Testing URL: {TEST_URL}")

try:
    # Pre-validation: Ensure the asset is reachable and is a valid audio file
    response = requests.get(TEST_URL)
    print(f"   - HTTP Status: {response.status_code}")
    print(f"   - Content Type: {response.headers.get('Content-Type')}")
    print(f"   - File Size: {len(response.content)} bytes")

    if response.status_code != 200:
        print("   ❌ ERROR: The URL is not reachable or permission denied.")
        exit()
    
    if "audio" not in response.headers.get('Content-Type', ''):
        print("   ❌ ERROR: The URL did not return an audio file (returned HTML/JSON/Text).")
        print("   - First 100 chars of content:", response.text[:100])
        exit()

    print("\n2. Sending to Local AI API...")
    api_url = "http://127.0.0.1:8000/classify-custom"
    api_res = requests.post(api_url, json={"file_url": TEST_URL})
    
    print("3. API Response:")
    print(json.dumps(api_res.json(), indent=2))

except Exception as e:
    print(f"Script Error: {e}")