# Aura ML Brain 🧠

> **Microservice Orchestration Layer for Intelligent Audio & Emotion Analysis**

Aura ML Brain is a high-performance Python microservice built with **FastAPI**. It serves as the intelligence core for the Aura platform, coordinating communication between the Next.js frontend and various specialized AI models. It handles complex tasks like semantic search, audio classification, emotion recognition, and personalized recommendations.

## 🚀 Features

- **Semantic Search**: Uses `SentenceTransformer` (all-MiniLM-L6-v2) to understand natural language queries and retrieve relevant sounds from Supabase.
- **Audio Intelligence**:
  - **Audio Classification**: Tags audio files using an AST (Audio Spectrogram Transformer) model.
  - **Custom CNN Inference**: Specialized UrbanSound8K model for environmental sound detection.
  - **Waveform Extraction**: Generates visual waveform data for frontend visualization.
- **Multimodal "Face DJ"**: Detects emotions from user images (FER-2013) and continuously maps them to matching sonic atmospheres.
- **Recommendation Engine**: Uses SVD (Singular Value Decomposition) and Collaborative Filtering to suggest sounds based on user listening history.
- **"Surprise Me" Mix Generator**: Creates curated 4-track soundscapes based on abstract vibed (e.g., "Zen", "Focus").
- **Security**: Global API Key validation via `x-api-key` header to ensure secure communication.

## 🛠️ Tech Stack

- **Framework**: [FastAPI](https://fastapi.tiangolo.com/) (Async, High-performance)
- **Database & Vector Store**: [Supabase](https://supabase.com/) (PostgreSQL + pgvector)
- **ML Libraries**:
  - PyTorch / TensorFlow (Model Inference)
  - SentenceTransformers (Embeddings)
  - Scikit-learn (Recommendations)
  - Librosa (Audio Processing)
- **Infrastructure**: Docker / Cloud Run (Recommended for deployment)

## 📂 Project Structure

```bash
aura-ml/
├── core/                   # Core configurations and schedulers
├── data/                   # Local data storage (if any)
├── scripts/                # Utility scripts (data ingestion, verification)
├── services/               # Specialized AI Services
│   ├── audio_classifier.py    # AST Model Logic
│   ├── audio_processor.py     # Librosa Waveform Extraction
│   ├── custom_cnn.py          # UrbanSound8K Custom Model
│   ├── emotion_classifier.py  # Face Emotion Detection
│   ├── recommendation_engine.py # SVD Recommender
│   └── sentiment_analyzer.py  # Text Sentiment Analysis
├── tests/                  # Pytest Unit Tests
├── main.py                 # Application Entry Point & API Routes
├── ingest_data.py          # Data Ingestion Script
├── verify_integrations.py  # Integration Testing Script
└── .env                    # Environment Variables (GitIgnored)
```

## ⚡ Getting Started

### Prerequisites

- Python 3.9+
- [Supabase](https://supabase.com/) Account & Project
- Virtual Environment (Recommended)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-org/aura-ml.git
    cd aura-ml
    ```

2.  **Create and Activate Virtual Environment:**
    ```bash
    python -m venv venv
    # Windows
    .\venv\Scripts\activate
    # Mac/Linux
    source venv/bin/activate
    ```

3.  **Install Dependencies:**
    ```bash
    # Assuming requirements.txt exists (create one if not)
    pip install -r requirements.txt
    ```
    *Note: Core libraries include `fastapi`, `uvicorn`, `supabase`, `sentence-transformers`, `torch`, `scikit-learn`, `librosa`, `python-multipart`.*

4.  **Configure Environment:**
    Create a `.env` file in the root directory:
    ```env
    SUPABASE_URL="your-supabase-url"
    SUPABASE_KEY="your-supabase-service-role-key" 
    AURA_API_KEY="your-secure-api-key"
    FREESOUND_API_KEY="your-freesound-api-key" # Optional: For data ingestion
    ```

### Running the Server

Start the FastAPI development server:

```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

- **Swagger UI**: Visit `http://localhost:8000/docs` for interactive API documentation.
- **ReDoc**: Visit `http://localhost:8000/redoc` for alternative documentation.

### Data Ingestion (Optional)

To populate your Supabase database with initial sound data from Freesound.org:

1.  Get an API Key from [Freesound](https://freesound.org/help/developers/).
2.  Add `FREESOUND_API_KEY` to your `.env` file.
3.  Run the ingestion script:
    ```bash
    python ingest_data.py
    ```

## 🔌 API Endpoints

### 🔍 Search & Discovery
- `POST /search`: Semantic search for sounds using text queries.
- `POST /search-knowledge`: RAG-based search for scientific knowledge snippets.
- `POST /find-similar`: Find sounds chemically similar to a given sound ID.

### 🎧 Audio Analysis
- `POST /analyze-waveform`: Extract waveform data points for visualization.
- `POST /classify-audio`: Classify audio using the standard AST model.
- `POST /classify-custom`: Classify audio using the custom CNN model.

### 🎭 User Experience
- `POST /analyze-face`: Upload an image to detect emotion and get a matching sound mix.
- `POST /recommend`: Get personalized sound recommendations for a user.
- `POST /generate-mix`: Generate a random "Surprise Me" mix based on a scenario.

### ⚙️ System
- `POST /admin/retrain`: Manually trigger a model retraining (Admin only).
- `GET /`: Health check to verify service status.

## 🧪 Testing

Run the included test suite using `pytest`:

```bash
nums pytest
```

Or run specific integration scripts:

```bash
python verify_integrations.py
```

## 🛡️ Security

This microservice is protected by a custom API Key middleware. All requests (except health check and optionally doc pages in dev) must include the header:

```http
x-api-key: YOUR_SECRET_KEY
```

Make sure to set `AURA_API_KEY` in your `.env` file.
