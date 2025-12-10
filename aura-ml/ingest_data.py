"""
Data Ingestion Pipeline.

Orchestrates the aggregation of audio assets from external providers (Freesound.org) into the Aura ecosystem.
Pipeline Stages:
1. Retrieval: Query Freesound API for high-quality audio metadata and preview links.
2. Vectorization: Generate semantic embeddings for sound descriptions using 'all-MiniLM-L6-v2'.
3. Persistence: Upsert structured assets (metadata + embeddings) into the Supabase 'sounds' table.
"""

import os
import requests
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY") 
FREESOUND_API_KEY = os.getenv("FREESOUND_API_KEY")

if not SUPABASE_URL or not SUPABASE_KEY or not FREESOUND_API_KEY:
    print("Error: Missing API Keys in .env file")
    exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

print("Loading AI Model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2') 

def fetch_freesound_data(query, count=5):
    """
    Executes a search against the Freesound API v2.
    Filters results for optimal duration (60-300s) to match the platform's focus/sleep use cases.
    """
    print(f"Fetching {count} sounds for query: '{query}'...")
    url = "https://freesound.org/apiv2/search/text/"
    params = {
        "query": query,
        "token": FREESOUND_API_KEY,
        "fields": "id,name,previews,tags,description,duration",
        "page_size": count,
        "filter": "duration:[60 TO 300]" 
    }
    try:
        response = requests.get(url, params=params)
        response.raise_for_status()
        return response.json().get('results', [])
    except Exception as e:
        print(f"Freesound API Error: {e}")
        return []

def generate_embedding(text):
    return model.encode(text).tolist()

def run_pipeline():
    queries = ["rain", "forest", "ocean", "white noise", "piano", "meditation", "fireplace", "thunder"]
    
    for query in queries:
        sounds = fetch_freesound_data(query, count=5) 
        
        for sound in sounds:
            title = sound['name']
            file_url = sound['previews']['preview-hq-mp3']
            tags = sound['tags']
            duration = sound['duration']
            
            description_for_ai = f"{title} {' '.join(tags)}"
            vector = generate_embedding(description_for_ai)
            
            print(f"Processing: {title}...")

            data = {
                "title": title,
                "file_url": file_url,
                "tags": tags,
                "duration_seconds": int(duration),
                "embedding": vector,
            }
            
            try:
                supabase.table("sounds").upsert(data, on_conflict="file_url").execute()
                print(f"✅ Saved: {title}")
            except Exception as e:
                print(f"❌ Error saving {title}: {e}")

if __name__ == "__main__":
    run_pipeline()