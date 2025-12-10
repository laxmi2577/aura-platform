"""
Manual Verification Script: Recommendations.

A lightweight utility for locally testing the `/recommend` endpoint.
Used to verify that the Collaborative Filtering engine returns valid JSON responses 
for a known sound ID.
"""

import requests
import json

# Replace with a valid Sound ID from your local Supabase instance
TEST_ID = "3a98c945-87ba-41cb-b58b-19e8db2ab66d" 

print(f"Getting recommendations for: {TEST_ID}")
res = requests.post("http://127.0.0.1:8000/recommend", json={"sound_id": TEST_ID})
print(json.dumps(res.json(), indent=2))