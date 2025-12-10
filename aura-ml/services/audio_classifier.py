import requests
import io
import librosa
import numpy as np
from transformers import pipeline

# ---------------------------------------------------------
# Aesthetic Mapping Layer
# Translates technical audio classifications (AudioSet ontology) into 
# "Aura" brand-aligned descriptive tags.
# ---------------------------------------------------------
VIBE_MAP = {
    # --- NATURE & WATER ---
    "Rain": "Rainfall",
    "Raindrop": "Light Rain",
    "Thunderstorm": "Thunder & Storm",
    "Thunder": "Distant Thunder",
    "Water": "Flowing Water",
    "Stream": "Forest Creek",
    "River": "Rushing River",
    "Ocean": "Ocean Waves",
    "Waves, surf": "Crashing Surf",
    "Beach, coast": "Coastal Breeze",
    "Waterfall": "Majestic Falls",
    "Drip": "Cave Droplets",
    
    # --- FOREST & ANIMALS ---
    "Bird": "Morning Birds",
    "Bird vocalization, bird call, bird song": "Forest Canopy",
    "Owl": "Night Owl",
    "Cricket": "Summer Crickets",
    "Insect": "Nature Hum",
    "Frog": "Wetland Ambience",
    "Animal": "Wilderness",
    "Wind": "Breeze",
    "Rustling leaves": "Autumn Leaves",
    "Forest": "Deep Woods",
    
    # --- URBAN & CITY ---
    "Traffic noise, roadway noise": "City Hum",
    "Car": "Urban Travel",
    "Vehicle": "City Transit",
    "Bus": "Night Bus",
    "Subway, metro, underground": "Underground Echo",
    "Train": "Rail Rhythm",
    "Siren": "City Alert",
    "Car horn, honking": "Downtown Chaos",
    "Street music": "Street Performer",
    "Crowd": "Public Space",
    "Chatter": "Coffee Shop Vibe",
    "Walk, footsteps": "City Walk",
    
    # --- HOME & INDOOR ---
    "Typing": "Focus Work",
    "Computer keyboard": "Mechanical Typing",
    "Writing": "Study Session",
    "Clock": "Time Passing",
    "Tick-tock": "Focus Rhythm",
    "Door": "Entryway",
    "Dishes, pots, and pans": "Kitchen Ambience",
    "Frying (food)": "Cooking ASMR",
    "Microwave oven": "Late Night Snack",
    "Air conditioner": "Cooling Hum",
    "Fan": "White Noise Fan",
    
    # --- NOISE & TEXTURE ---
    "White noise": "Pure Focus",
    "Pink noise": "Deep Sleep",
    "Static": "Retro Radio",
    "Hum": "Generator Drone",
    "Silence": "Deep Silence",
    "Noise": "Industrial Texture",
    "Engine": "Low Rumble",
    "Idling": "Engine Drone",
    
    # --- MUSICAL & INSTRUMENTS ---
    "Music": "Melodic Background",
    "Musical instrument": "Instrumental",
    "Piano": "Calm Piano",
    "Guitar": "Acoustic Vibes",
    "Flute": "Meditative Flute",
    "Bell": "Temple Bell",
    "Chime": "Wind Chimes",
    "Singing bowl": "Tibetan Healing",
    
    # --- FIRE ---
    "Fire": "Campfire",
    "Crackling, fire": "Fireplace Crackle",
}

class AudioClassifier:
    """
    Singleton wrapper for the Audio Spectrogram Transformer (AST) pipeline.
    Ensures the heavy neural network model is loaded only once per application lifecycle.
    Uses the 'mit/ast-finetuned-audioset' model for state-of-the-art environmental sound classification.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            print("⏳ Loading Neural Network (MIT/AST)...")
            cls._instance = pipeline(
                "audio-classification", 
                model="mit/ast-finetuned-audioset-10-10-0.4593"
            )
            print("✅ Neural Network Loaded.")
        return cls._instance

def predict_sound_class(file_url: str):
    """
    Executes the audio classification inference pipeline.
    
    Process Flow:
    1. Ingestion: stream audio file from remote URL into memory.
    2. Preprocessing: Resample audio to 16kHz (native sampling rate for AST).
    3. Inference: Forward pass through the Transformer model.
    4. Post-processing: Map raw logits to user-friendly "Vibe" labels using heuristic matching.
    """
    try:
        print(f"1. Downloading audio: {file_url[:50]}...")
        response = requests.get(file_url)
        response.raise_for_status()
        
        print("2. Decoding audio with Librosa...")
        # Force 16000Hz for the AI model
        audio_bytes = io.BytesIO(response.content)
        audio_array, sampling_rate = librosa.load(audio_bytes, sr=16000)

        print("3. Running Inference...")
        classifier = AudioClassifier.get_instance()
        
        # Get top 5 predictions to increase chance of a good "Vibe" match
        raw_predictions = classifier(audio_array, top_k=5)
        
        # 4. Map Labels to "Aura Vibes"
        mapped_predictions = []
        for p in raw_predictions:
            original_label = p['label']
            # Try to match exact label, or check if part of the label is in our map
            friendly_label = VIBE_MAP.get(original_label)
            
            # If no exact match, try partial match (e.g. "Heavy Rain" matches "Rain")
            if not friendly_label:
                for key, val in VIBE_MAP.items():
                    if key.lower() in original_label.lower():
                        friendly_label = val
                        break
            
            # Default fallback
            if not friendly_label:
                friendly_label = original_label

            mapped_predictions.append({
                "label": friendly_label,
                "original_label": original_label,
                "score": float(p['score'])
            })
        
        print("✅ Classification Success!")
        return mapped_predictions

    except Exception as e:
        print(f"❌ CRITICAL ERROR in Audio Classifier: {e}")
        return [{"label": f"Error: {str(e)[:50]}", "score": 0.0}]