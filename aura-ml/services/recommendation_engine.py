import pandas as pd
import numpy as np
import random
import os
from sklearn.decomposition import TruncatedSVD
from supabase import create_client

class RecommenderSystem:
    """
    Collaborative Filtering Engine.
    
    Implements a matrix factorization approach using SVD (Singular Value Decomposition) 
    to discover latent patterns in user-sound interactions.
    
    Architecture:
    - Data Ingestion: Fetches interaction logs (user_id, sound_id) from Supabase.
    - Matrix Construction: Pivot table representing Implicit Feedback (1 = interaction).
    - Dimensionality Reduction: SVD compression to find 'n' latent features.
    - Similarity: Pearson correlation coefficient on reduced feature vectors.
    
    Strategy: 
    - Hybrid Startup: Uses Real data if sufficient (>50 rows), otherwise falls back 
      to Synthetic data to solve the 'Cold Start' problem for demonstrations.
    """
    _instance = None

    def __init__(self):
        print("⏳ Initializing Recommendation Engine...")
        self.url = os.getenv("SUPABASE_URL")
        self.key = os.getenv("SUPABASE_KEY")
        self.supabase = create_client(self.url, self.key)
        self.model = None
        self.user_item_matrix = None
        self.sound_ids = []
        
        # Train immediately on startup
        self.train_mock_model()

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = RecommenderSystem()
        return cls._instance

    def train_mock_model(self):
        max_retries = 3
        for attempt in range(max_retries):
            try:
                print(f"🔄 Training Recommendation Model (Attempt {attempt+1}/{max_retries})...")
                
                # 1. Fetch Real Interactions from DB
                response = self.supabase.table("user_interactions").select("user_id, sound_id").execute()
                real_interactions = response.data
                
                # 2. Fetch All Sound IDs (for validation)
                sound_res = self.supabase.table("sounds").select("id").execute()
                self.sound_ids = [s['id'] for s in sound_res.data]
                break # Success!
            except Exception as e:
                if attempt == max_retries - 1:
                    print(f"⚠️ Recommender Offline: Could not connect to DB ({str(e)}). Using random fallback.")
                    self.sound_ids = [] # Empty list triggers fallback in recommend_for_sound
                    return
                import time
                time.sleep(1)

        if not self.sound_ids:
            print("❌ No sounds found in DB.")
            return

        try:

            data = []
            
            # --- HYBRID TRAINING STRATEGY ---
            if len(real_interactions) > 50:
                print(f"✅ Found {len(real_interactions)} REAL user interactions! Training on real data.")
                # Convert DB rows to Matrix format (1 = implicit like)
                for row in real_interactions:
                    data.append([row['user_id'], row['sound_id'], 1])
            else:
                print(f"⚠️ Only {len(real_interactions)} interactions found. Using SYNTHETIC data for Cold Start.")
                # Fallback to Synthetic Data (so the demo always works)
                for sound_id in self.sound_ids:
                    # Ensure every sound has at least some activity
                    for _ in range(3):
                        user_id = f"mock_user_{random.randint(1, 50)}"
                        data.append([user_id, sound_id, 1])
                
                # Add random noise
                for _ in range(200):
                    user_id = f"mock_user_{random.randint(1, 50)}"
                    sound_id = random.choice(self.sound_ids)
                    data.append([user_id, sound_id, 1])

            # 3. Create Matrix
            df = pd.DataFrame(data, columns=['user_id', 'sound_id', 'rating'])
            
            self.user_item_matrix = df.pivot_table(
                index='user_id', 
                columns='sound_id', 
                values='rating'
            ).fillna(0)

            # 4. Train SVD
            n_features = self.user_item_matrix.shape[1]
            n_components = min(12, n_features - 1)
            n_components = max(1, n_components)

            self.model = TruncatedSVD(n_components=n_components, random_state=42)
            self.matrix_reduced = self.model.fit_transform(self.user_item_matrix)
            
            self.corr_matrix = np.corrcoef(self.matrix_reduced)
            
            print(f"✅ Model Trained. Matrix Shape: {self.user_item_matrix.shape}")

        except Exception as e:
            print(f"❌ Recommender Training Error: {e}")

    def recommend_for_sound(self, sound_id, top_k=4):
        # Fallback Helper
        def get_random_fallback():
            print(f"⚠️ Fallback: Returning random sounds for {sound_id}")
            candidates = [s for s in self.sound_ids if s != sound_id]
            return random.sample(candidates, min(len(candidates), top_k))

        if not self.model or not self.sound_ids:
            return []

        try:
            # Check if sound exists in our training matrix
            if sound_id not in self.user_item_matrix.columns:
                return get_random_fallback()

            # Find index
            sound_idx = list(self.user_item_matrix.columns).index(sound_id)
            
            # Get correlations
            if sound_idx >= len(self.corr_matrix):
                return get_random_fallback()

            corr_scores = self.corr_matrix[sound_idx]
            
            # Sort (highest correlation first)
            similar_indices = np.argsort(corr_scores)[::-1]
            
            # Convert indices back to IDs
            recommendations = []
            for idx in similar_indices:
                candidate_id = self.user_item_matrix.columns[idx]
                if candidate_id != sound_id:
                    recommendations.append(candidate_id)
                    if len(recommendations) >= top_k:
                        break
            
            if not recommendations:
                return get_random_fallback()

            return recommendations

        except Exception as e:
            print(f"Recommendation Error: {e}")
            return get_random_fallback()

# Standalone test
if __name__ == "__main__":
    rec = RecommenderSystem()
    if rec.sound_ids:
        test_id = rec.sound_ids[0]
        print(f"\nTesting ID: {test_id}")
        print(rec.recommend_for_sound(test_id))
