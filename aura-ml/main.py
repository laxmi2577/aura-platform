"""
Aura ML Brain (Microservice Entry Point).

This module serves as the central orchestration layer for the Python-based machine learning services.
It facilitates communication between the Next.js frontend and various specialized AI models.

Architecture:
- Framework: FastAPI (High-performance, async-ready web framework).
- Security: Global API Key validation via 'x-api-key' header middleware.
- Data Layer: Direct integration with Supabase for vector search and metadata retrieval.
- AI Logic: Coordinates multiple specialized services:
    - Audio Classification (AST Model)
    - Custom CNN Inference (UrbanSound8K)
    - Recommendation Engine (Collaborative Filtering / SVD)
    - Emotion Recognition (FER-2013)
    - Sentiment Analysis (TextBlob)

Lifecycle:
- The `lifespan` context manager ensures all heavy ML models are pre-loaded ("warmed up")
  during server startup to minimize latency for the first user request.
"""

import os
import json
from fastapi import FastAPI, HTTPException, Security, Depends
from fastapi.security.api_key import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from dotenv import load_dotenv
from contextlib import asynccontextmanager

# Services
from services.audio_classifier import predict_sound_class
from services.custom_cnn import predict_with_custom_model
from services.recommendation_engine import RecommenderSystem
from services.audio_processor import extract_waveform
from services.emotion_classifier import detect_emotion
from services.sentiment_analyzer import analyze_sentiment
from core.scheduler import start_scheduler

# -------------------------------------------------
# 1. Environment Configuration
# -------------------------------------------------
load_dotenv(override=True)

# Debug: Print loaded Supabase URL
_url = os.getenv("SUPABASE_URL")
if _url:
    _masked = _url[:8] + "*" * (len(_url) - 16) + _url[-8:]
    print(f"✅ Loaded SUPABASE_URL: {_masked}")
else:
    print("❌ SUPABASE_URL is missing!")

# -------------------------------------------------
# 2. Security Layer (API Gatekeeper)
# -------------------------------------------------
API_KEY_NAME = "x-api-key"
# Defines the expected header for Swagger UI and security dependency injection
api_key_header = APIKeyHeader(name=API_KEY_NAME, auto_error=False)

async def verify_api_key(api_key_header: str = Security(api_key_header)):
    """
    Security Middleware.
    Enforces authentication by validating the 'x-api-key' header against the server-side secret.
    Raises 403 Forbidden if the key is missing or invalid.
    """
    correct_key = os.getenv("AURA_API_KEY")
    
    # If no key set on server, assume open access (Development mode safeguard)
    if not correct_key:
        print("⚠️ WARNING: No AURA_API_KEY set in .env. API is insecure.")
        return True

    if api_key_header == correct_key:
        return True
    
    print(f"⛔ Blocked unauthorized request. Key provided: {api_key_header}")
    raise HTTPException(status_code=403, detail="Could not validate credentials")

# -------------------------------------------------
# 3. Infrastructure Initialization
# -------------------------------------------------
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

print("Loading AI Model (all-MiniLM-L6-v2)...")
model = SentenceTransformer('all-MiniLM-L6-v2')
print("AI Model Loaded.")

recommender = RecommenderSystem.get_instance()

# -------------------------------------------------
# 4. Application Lifecycle Management
# -------------------------------------------------
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Context Manager for Startup/Shutdown events.
    Crucial for 'Model Warm-up': Triggers the loading of heavy Neural Networks
    into memory BEFORE the server accepts traffic, preventing cold-start lag.
    """
    print("🚀 Starting Aura AI Services...")
    # Warm up models
    _ = RecommenderSystem.get_instance()
    from services.audio_classifier import AudioClassifier
    AudioClassifier.get_instance()
    from services.emotion_classifier import EmotionClassifier
    EmotionClassifier.get_instance()
    
    start_scheduler()
    yield
    print("🛑 Shutting down Aura AI Services...")

# -------------------------------------------------
# 5. FastAPI Application Construction
# -------------------------------------------------
# Dependencies are applied globally to protect all routes by default
app = FastAPI(lifespan=lifespan, dependencies=[Depends(verify_api_key)])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------
# 6. Data Transfer Objects (DTOs)
# -------------------------------------------------
class SearchQuery(BaseModel):
    query: str
    match_threshold: float = 0.5
    match_count: int = 10

class AnalysisRequest(BaseModel):
    file_url: str

class RecommendRequest(BaseModel):
    sound_id: str

class FindSimilarRequest(BaseModel):
    sound_id: str
    match_count: int = 10

class FaceRequest(BaseModel):
    image: str

class SentimentRequest(BaseModel):
    text: str

class MixRequest(BaseModel):
    scenario: str

# -------------------------------------------------
# 7. Endpoint Definitions
# -------------------------------------------------

@app.post("/search-knowledge")
def search_knowledge(payload: SearchQuery):
    """Retrieves standard RAG knowledge snippets based on semantic similarity."""
    try:
        print(f"📚 Searching Knowledge for: {payload.query}")
        query_vector = model.encode(payload.query).tolist()
        response = supabase.rpc("match_knowledge", {
            "query_embedding": query_vector,
            "match_threshold": 0.3,
            "match_count": 3
        }).execute()
        return {"results": response.data}
    except Exception as e:
        print(f"Knowledge Search Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/search")
def search_sounds(payload: SearchQuery):
    """Semantic Search entry point. Converts text queries to vectors and scans the Supabase index."""
    try:
        print(f"Searching for: {payload.query}")
        query_vector = model.encode(payload.query).tolist()
        response = supabase.rpc("match_sounds", {
            "query_embedding": query_vector,
            "match_threshold": payload.match_threshold,
            "match_count": payload.match_count,
        }).execute()
        return {"results": response.data}
    except Exception as e:
        print(f"Search Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-waveform")
def analyze_audio(payload: AnalysisRequest):
    """Extracts a simplified visual waveform (amplitude vs time) from an audio file."""
    try:
        waveform = extract_waveform(payload.file_url, n_points=50)
        return {"waveform": waveform}
    except Exception as e:
        print(f"Error in analyze_audio: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/classify-audio")
def classify_audio(payload: AnalysisRequest):
    """Runs the primary AST model to tag audio files with 'Vibe' labels."""
    predictions = predict_sound_class(payload.file_url)
    return {"predictions": predictions}

@app.post("/classify-custom")
def classify_custom(payload: AnalysisRequest):
    """Runs the specialized UrbanSound8K Custom CNN inference pipeline."""
    return predict_with_custom_model(payload.file_url)

@app.post("/recommend")
def get_recommendations(payload: RecommendRequest):
    """Generates personalized recommendations based on the SVD collaborative filtering matrix."""
    recommended_ids = recommender.recommend_for_sound(payload.sound_id)
    response = supabase.table("sounds").select("*").in_("id", recommended_ids).execute()
    return {"recommendations": response.data}

@app.post("/find-similar")
def find_similar(payload: FindSimilarRequest):
    """Finds chemically similar sounds using vector distance (Latent Space traversal)."""
    try:
        print(f"🔍 Finding similar for: {payload.sound_id}")
        source_response = supabase.table("sounds").select("embedding").eq("id", payload.sound_id).execute()
        
        if not source_response.data:
            raise HTTPException(status_code=404, detail="Source sound not found")
            
        embedding_data = source_response.data[0]['embedding']
        if not embedding_data:
            random_response = supabase.table("sounds").select("*").limit(4).execute()
            return {"results": random_response.data}

        query_vector = json.loads(embedding_data) if isinstance(embedding_data, str) else embedding_data

        response = supabase.rpc("match_sounds", {
            "query_embedding": query_vector,
            "match_threshold": 0.3,
            "match_count": payload.match_count,
        }).execute()

        results = [s for s in response.data if s['id'] != payload.sound_id]
        return {"results": results}
    except Exception as e:
        print(f"❌ Find Similar Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-face")
def analyze_face(payload: FaceRequest):
    """
    Multimodal Pipeline: Face -> Emotion -> Sound.
    1. Detects emotion from the input image.
    2. Maps emotion to a sonic 'scenario'.
    3. Retrieves a matching soundscape using vector search.
    """
    try:
        emotion_data = detect_emotion(payload.image)
        emotion = emotion_data['label']
        
        vibe_map = {
            "happy": "energetic upbeat sunny",
            "sad": "comforting rain cozy",
            "angry": "calm zen meditation",
            "fear": "safe reassuring warm",
            "surprise": "magical ethereal",
            "neutral": "focus deep work",
            "disgust": "cleansing water fresh"
        }
        search_query = vibe_map.get(emotion, "relaxing")
        print(f"🎭 Face: {emotion} -> 🎵 DJ Query: {search_query}")

        query_vector = model.encode(search_query).tolist()
        response = supabase.rpc("match_sounds", {
            "query_embedding": query_vector,
            "match_threshold": 0.20,
            "match_count": 4
        }).execute()

        return {
            "emotion": emotion,
            "confidence": emotion_data['score'],
            "mix": response.data
        }
    except Exception as e:
        print(f"Face Analysis Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-sentiment")
def get_sentiment(payload: SentimentRequest):
    """Analyzes text input for polarity and returns simple sentiment labels."""
    return analyze_sentiment(payload.text)

@app.post("/generate-mix")
def generate_mix(payload: MixRequest):
    """
    'Surprise Me' Logic.
    Generates a curated 4-track mix based on an abstract user scenario (e.g., 'Focus', 'Relax').
    Uses randomization to ensure variety in repeated requests.
    """
    try:
        import random
        print(f"🎛️ Generating mix for: {payload.scenario}")
        query_vector = model.encode(payload.scenario).tolist()
        
        response = supabase.rpc("match_sounds", {
            "query_embedding": query_vector,
            "match_threshold": 0.25,
            "match_count": 20
        }).execute()

        candidates = response.data
        if len(candidates) < 4:
            random_res = supabase.table("sounds").select("*").limit(10).execute()
            candidates.extend(random_res.data)

        selected_sounds = []
        seen_ids = set()
        random.shuffle(candidates)
        
        for sound in candidates:
            if sound['id'] not in seen_ids:
                selected_sounds.append(sound)
                seen_ids.add(sound['id'])
            if len(selected_sounds) >= 4: break
                
        mix = []
        volumes = [0.8, 0.5, 0.3, 0.2]
        for i, sound in enumerate(selected_sounds):
            mix.append({**sound, "volume": volumes[i] if i < len(volumes) else 0.2})

        return {"mix": mix}
    except Exception as e:
        print(f"Mix Gen Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/admin/retrain")
def force_retrain():
    """Manual trigger endpoint for Admin users to force a model refresh."""
    try:
        print("⚡ Manual Retraining Triggered by Admin")
        recommender = RecommenderSystem.get_instance()
        recommender.train_mock_model()
        return {"status": "success", "message": "Model retrained."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"status": "Aura ML Brain is Online 🧠"}