import librosa
import numpy as np
import requests
import io

def extract_waveform(file_url: str, n_points: int = 100):
    """
    Audio Signal Processing Utility.
    Downloads an audio file and generates a simplified waveform representation for UI visualization.
    
    Optimization Strategy:
    - Downsamples the high-fidelity audio (44.1kHz+) into a compact array of 'n_points' (default 100).
    - Calculates the mean amplitude for each segment to preserve the visual "shape" of the sound without data bloat.
    - Normalizes values to a 0.0 - 1.0 range for CSS styling compatibility.
    """
    try:
        # 1. Download the file into memory (don't save to disk)
        response = requests.get(file_url)
        response.raise_for_status()
        audio_bytes = io.BytesIO(response.content)

        # 2. Load with Librosa
        # sr=None means keep original sampling rate
        y, sr = librosa.load(audio_bytes, sr=None)

        # 3. Downsample to n_points (we don't need 44,000 points for a tiny UI card)
        # We take the absolute value (amplitude)
        y_abs = np.abs(y)
        
        # Calculate how many samples per point
        step = len(y_abs) // n_points
        
        # Take the average amplitude for each chunk
        waveform = []
        for i in range(0, len(y_abs), step):
            chunk = y_abs[i:i+step]
            if len(chunk) > 0:
                avg_amp = np.mean(chunk)
                waveform.append(float(avg_amp))
        
        # Normalize to 0.0 - 1.0 range for easy CSS scaling
        if len(waveform) > 0:
            max_val = max(waveform)
            if max_val > 0:
                waveform = [x / max_val for x in waveform]

        return waveform[:n_points] # Ensure exact length

    except Exception as e:
        print(f"Audio Analysis Error: {e}")
        return []