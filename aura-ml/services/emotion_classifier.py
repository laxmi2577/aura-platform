import base64
import io
from PIL import Image
from transformers import pipeline

class EmotionClassifier:
    """
    Computer Vision Pipeline Singleton.
    Wraps the Hugging Face Transformers pipeline for facial emotion recognition.
    Utilizes a model fine-tuned on the FER-2013 dataset for high-accuracy emotion detection.
    """
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            print("⏳ Loading Vision Model (Facial Emotion)...")
            from transformers import logging
            logging.set_verbosity_error() # <--- Suppress warnings
            
            # We use a high-performance model fine-tuned on FER-2013
            cls._instance = pipeline(
                "image-classification", 
                model="dima806/facial_emotions_image_detection" 
            )
            print("✅ Vision Model Loaded.")
        return cls._instance

def detect_emotion(base64_image: str):
    """
    Performs emotion inference on a base64 encoded image.
    
    Includes heuristic post-processing to reduce "Neutral Bias":
    - Since 'neutral' is a common default catch-all state, this logic prioritizes 
      stronger emotional signals (e.g., 'happy', 'sad') if they are detected 
      with sufficiently high confidence nearby the top score.
    """
    try:
        # 1. Clean up the Base64 string (remove "data:image/jpeg;base64,")
        if "," in base64_image:
            base64_image = base64_image.split(",")[1]
        
        # 2. Decode Image
        image_bytes = base64.b64decode(base64_image)
        image = Image.open(io.BytesIO(image_bytes))

        # 3. Run Inference
        classifier = EmotionClassifier.get_instance()
        predictions = classifier(image)
        
        # 4. Get Top Predictions (Top 3)
        top_preds = predictions[:3]
        top_emotion = top_preds[0]
        
        # --- LOGIC IMPROVEMENT: Anti-Neutral Bias ---
        # If 'neutral' is #1, but a strong emotion is a close second, pick the strong one.
        if top_emotion['label'] == 'neutral' and len(top_preds) > 1:
            second_emotion = top_preds[1]
            # If the gap is small (< 20%)
            if (top_emotion['score'] - second_emotion['score']) < 0.2:
                print(f"🔄 Override Neutral: Picking '{second_emotion['label']}' ({second_emotion['score']:.2f})")
                top_emotion = second_emotion

        # Threshold check (ignore very weak predictions)
        if top_emotion['score'] < 0.25:
             print(f"⚠️ Low Confidence ({top_emotion['score']:.2f}). Defaulting to Neutral.")
             return {"label": "neutral", "score": 0.0}

        print(f"👁️ Detected: {top_emotion['label']} ({top_emotion['score']:.2f})")
        return top_emotion

    except Exception as e:
        print(f"❌ Vision Error: {e}")
        return {"label": "neutral", "score": 0.0}