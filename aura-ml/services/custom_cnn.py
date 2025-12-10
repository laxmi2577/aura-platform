import torch
import torch.nn as nn
import librosa
import numpy as np
import io
import requests

# ---------------------------------------------------------
# Neural Network Architecture
# 4-Layer 2D Convolutional Neural Network (CNN) optimized for 
# Mel-Spectrogram classification (UrbanSound8K taxonomy).
# ---------------------------------------------------------
class AudioCNN(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Sequential(
            nn.Conv2d(1, 8, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        self.conv2 = nn.Sequential(
            nn.Conv2d(8, 16, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        self.conv3 = nn.Sequential(
            nn.Conv2d(16, 32, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        self.conv4 = nn.Sequential(
            nn.Conv2d(32, 64, kernel_size=3, stride=1, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(kernel_size=2, stride=2)
        )
        self.flatten = nn.Flatten()
        self.linear = nn.Linear(64 * 4 * 2, 10) 

    def forward(self, x):
        x = self.conv1(x)
        x = self.conv2(x)
        x = self.conv3(x)
        x = self.conv4(x)
        x = self.flatten(x)
        logits = self.linear(x)
        return logits

# Training taxonomy labels from the UrbanSound8K dataset
LABELS = [
    "Air Conditioner", "Car Horn", "Children Playing", "Dog Bark",
    "Drilling", "Engine Idling", "Gun Shot", "Jackhammer", "Siren", "Street Music"
]

class CustomModelLoader:
    """
    Lazy-loading Singleton for the Custom CNN.
    Manages the lifecycle of the PyTorch model implementation to minimize memory overhead.
    """
    _model = None

    @classmethod
    def get_model(cls):
        if cls._model is None:
            print("Loading Custom CNN Weights...")
            model = AudioCNN()
            # Load weights (map_location='cpu' is crucial for deployment compatibility)
            try:
                state_dict = torch.load("aura_cnn_v1.pth", map_location=torch.device('cpu'))
                model.load_state_dict(state_dict)
                model.eval() # Set to inference mode
                cls._model = model
                print("✅ Custom CNN Loaded Successfully")
            except Exception as e:
                print(f"❌ Failed to load model: {e}")
        return cls._model

def predict_with_custom_model(file_url):
    """
    Executes inference using the bespoke CNN model.
    
    Preprocessing Pipeline (must align with training conditions):
    1. Resample to 16kHz.
    2. Normalize duration to exactly 1 second (pad/trim).
    3. Generate Log-Mel Spectrogram (64 mels, 1024 FFT).
    4. Normalize pixel values (0-1).
    5. Tensor Transformation (Add batch/channel dimensions).
    """
    try:
        # Download & Preprocess
        response = requests.get(file_url)
        audio_bytes = io.BytesIO(response.content)
        
        # Load 1 second of audio at 16k sample rate
        signal, sr = librosa.load(audio_bytes, sr=16000)
        
        # Pad or Cut to 16000 samples (1 sec)
        if len(signal) > 16000:
            signal = signal[:16000]
        else:
            padding = 16000 - len(signal)
            signal = np.pad(signal, (0, padding))

        # Mel Spectrogram
        mel_spec = librosa.feature.melspectrogram(
            y=signal, sr=16000, n_mels=64, n_fft=1024, hop_length=512
        )
        mel_spec = librosa.power_to_db(mel_spec, ref=np.max)
        
        # Normalize 0-1
        mel_spec = (mel_spec - mel_spec.min()) / (mel_spec.max() - mel_spec.min() + 1e-6)
        
        # Tensorize (Add batch and channel dims: 1, 1, 64, 32)
        input_tensor = torch.tensor(mel_spec, dtype=torch.float32).unsqueeze(0).unsqueeze(0)

        # Predict
        model = CustomModelLoader.get_model()
        if not model: return {"error": "Model not loaded"}
        
        with torch.no_grad():
            logits = model(input_tensor)
            probs = torch.nn.functional.softmax(logits, dim=1)
            
        # Get Top Prediction
        score, index = torch.max(probs, 1)
        return {
            "label": LABELS[index.item()],
            "confidence": float(score.item()),
            "model": "Custom CNN (UrbanSound8K)"
        }

    except Exception as e:
        return {"error": str(e)}