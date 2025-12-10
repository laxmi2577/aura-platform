from apscheduler.schedulers.background import BackgroundScheduler
from services.recommendation_engine import RecommenderSystem
from datetime import datetime

def retrain_task():
    """
    Orchestrates the periodic retraining of the recommendation model.
    Accesses the singleton RecommenderSystem to refresh the collaborative filtering matrix
    with the latest user interaction data from the database.
    """
    print(f"\n🔄 [Auto-Pipeline] Starting scheduled model retraining at {datetime.now()}...")
    
    recommender = RecommenderSystem.get_instance()
    
    # Triggers the mock training sequence to update the in-memory similarity matrix
    recommender.train_mock_model()
    
    print(f"✅ [Auto-Pipeline] Retraining complete. Model updated in-memory.\n")

def start_scheduler():
    """
    Initializes and starts the background task scheduler.
    Configures the retraining interval to ensure the recommendation engine remains 
    synchronized with evolving user preferences without blocking the main application thread.
    """
    scheduler = BackgroundScheduler()
    
    scheduler.add_job(retrain_task, 'interval', minutes=30)
    
    scheduler.start()
    print("🕒 AI Retraining Scheduler Started (Runs every 30 mins)")