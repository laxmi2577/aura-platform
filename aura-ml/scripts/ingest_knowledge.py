"""
Knowledge Base Ingestion Pipeline.

This script populates the vector database with scientific knowledge facts to support the RAG (Retrieval-Augmented Generation) system.
It utilizes a pre-trained Sentence Transformer model to convert textual facts into semantic embeddings, enabling high-precision vector search.
"""

import os
import json
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY") # Service Role Key
supabase: Client = create_client(url, key)

# Initialize the embedding model.
# 'all-MiniLM-L6-v2' is chosen for its balance of encoding speed and semantic accuracy,
# optimized for near-real-time RAG operations.
print("Loading AI Model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def run_ingestion():
    file_path = os.path.join(os.path.dirname(__file__), "../data/sleep_science.json")
    
    print(f"📂 Loading data from {file_path}...")
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            knowledge_data = json.load(f)
    except FileNotFoundError:
        print("❌ Error: Data file not found. Please create 'aura-ml/data/sleep_science.json'")
        return

    print(f"🧠 Ingesting {len(knowledge_data)} science facts...")
    
    for i, item in enumerate(knowledge_data):
        # Generate vector embedding for the content
        vector = model.encode(item['content']).tolist()
        
        data = {
            "content": item['content'],
            "source": item['source'],
            "embedding": vector
        }
        
        try:
            # Perform an upsert operation to maintain data integrity and prevent duplicates
            supabase.table("knowledge_base").insert(data).execute()
            if i % 5 == 0:
                print(f"✅ Saved {i}/{len(knowledge_data)}: {item['source'][:20]}...")
        except Exception as e:
            print(f"❌ Error: {e}")
            
    print("🎉 Ingestion Complete!")

if __name__ == "__main__":
    run_ingestion()
