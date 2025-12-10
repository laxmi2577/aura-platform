"""
Semantic Galaxy Generator.

This script executes a complete ETL (Extract, Transform, Load) pipeline to generate a 3D semantic visualization of the sound library.
It performs the following architectural steps:
1. Data Extraction: Fetches high-dimensional audio embeddings (384D) from the Supabase vector store.
2. Dimensionality Reduction: Applies t-SNE (t-Distributed Stochastic Neighbor Embedding) to project vectors into 3D space for spatial rendering.
3. Unsupervised Clustering: Utilizes K-Means clustering to identify distinct 'vibes' or sonic categories based on latent feature similarity.
4. Data Loading: Updates the database with the calculated 3D coordinates (x, y, z) and cluster labels for the frontend GlobeRenderer.
"""

import os
import numpy as np
import matplotlib.pyplot as plt
from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from sklearn.manifold import TSNE
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
from dotenv import load_dotenv

load_dotenv()
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

# High timeout configuration to accommodate heavy vector fetch operations
supabase: Client = create_client(
    url, 
    key, 
    options=ClientOptions(postgrest_client_timeout=60)
)

def process_galaxy():
    print("⏳ Fetching audio embeddings from Database...")
    
    response = supabase.table("sounds").select("id, title, embedding").execute()
    data = response.data
    
    if not data:
        print("❌ No data found. Run ingest_data.py first.")
        return

    print(f"🔍 Inspecting {len(data)} records...")

    valid_ids = []
    valid_vectors = []

    for item in data:
        emb = item.get('embedding')
        
        if emb is None:
            print(f"   ⚠️ Skipping '{item['title']}': No embedding.")
            continue

        if isinstance(emb, str):
            try:
                emb = eval(emb)
            except:
                continue
        
        if isinstance(emb, list) and len(emb) > 0:
            valid_ids.append(item['id'])
            valid_vectors.append(emb)
    
    if len(valid_vectors) < 5:
        print("❌ Not enough valid data points to run t-SNE. Need at least 5 sounds with embeddings.")
        return

    ids = valid_ids
    vectors = np.array(valid_vectors)
    
    print(f"📊 Processing {len(vectors)} valid sounds with {vectors.shape[1]} dimensions...")

    # Dimensionality Reduction Strategy:
    # t-SNE is preferred here over PCA for its ability to preserve local structure in non-linear manifolds,
    # making it ideal for visualizing clusters of semantically related sounds.
    print("... Running t-SNE to crunch dimensions to 3D ...")
    perp = min(30, len(vectors) - 1)
    tsne = TSNE(n_components=3, perplexity=perp, random_state=42, init='pca', learning_rate=200)
    vectors_3d = tsne.fit_transform(vectors)

    # Normalize coordinates to a fixed range for consistent rendering in the 3D scene
    scaler = MinMaxScaler(feature_range=(-50, 50))
    vectors_3d = scaler.fit_transform(vectors_3d)

    # Clustering Strategy:
    # K-Means partitions the sound space into distinct groups, allowing the UI to color-code
    # related sounds (e.g., 'Nature', 'Urban', 'Sleep') without manual tagging.
    print("... Running K-Means to find vibes ...")
    n_clusters = min(5, len(vectors))
    kmeans = KMeans(n_clusters=n_clusters, random_state=42)
    clusters = kmeans.fit_predict(vectors)

    print("💾 Saving coordinates to Supabase...")
    for i, sound_id in enumerate(ids):
        update_data = {
            "x_axis": float(vectors_3d[i][0]),
            "y_axis": float(vectors_3d[i][1]),
            "z_axis": float(vectors_3d[i][2]),
            "cluster_label": int(clusters[i])
        }
        
        try:
            supabase.table("sounds").update(update_data).eq("id", sound_id).execute()
            if i % 10 == 0 and i > 0: print(f"   Updated {i}/{len(ids)}...")
        except Exception as e:
            print(f"Error updating {sound_id}: {e}")

    print("✅ Galaxy Generation Complete!")

if __name__ == "__main__":
    process_galaxy()