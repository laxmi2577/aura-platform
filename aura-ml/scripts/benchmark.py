import time
import requests
import statistics
import os
from dotenv import load_dotenv

load_dotenv()

# CONFIG
API_URL = "http://127.0.0.1:8000"
API_KEY = os.getenv("AURA_API_KEY") 
HEADERS = {"x-api-key": API_KEY, "Content-Type": "application/json"}
TEST_PAYLOAD = {
    "query": "rainforest sounds for sleep",
    "match_threshold": 0.5,
    "match_count": 5
}

def run_benchmark(iterations=50):
    print(f"🚀 Starting Benchmark on {API_URL}...")
    print(f"📊 Running {iterations} requests...")
    
    latencies = []
    errors = 0
    
    start_time = time.time()
    
    for i in range(iterations):
        try:
            req_start = time.time()
            response = requests.post(f"{API_URL}/search", json=TEST_PAYLOAD, headers=HEADERS)
            req_end = time.time()
            
            if response.status_code == 200:
                latencies.append((req_end - req_start) * 1000)
            else:
                errors += 1
                print(f"Error: {response.status_code}")
        except Exception as e:
            errors += 1
            print(f"Connection Error: {e}")

    total_time = time.time() - start_time
    
    if not latencies:
        print("❌ All requests failed. Is the server running?")
        return

    # CALCULATE METRICS
    avg_lat = statistics.mean(latencies)
    p95_lat = statistics.quantiles(latencies, n=20)[18] # 95th percentile
    p99_lat = statistics.quantiles(latencies, n=100)[98] # 99th percentile
    rps = iterations / total_time

    print("\n" + "="*40)
    print("       ⚡ AURA ENGINE BENCHMARK ⚡       ")
    print("="*40)
    print(f"✅ Successful Requests: {iterations - errors}/{iterations}")
    print(f"⏱️  Average Latency:     {avg_lat:.2f} ms")
    print(f"🐢 P95 Latency (Lag):   {p95_lat:.2f} ms")
    print(f"🚀 Throughput:          {rps:.2f} Req/Sec")
    print("="*40)

if __name__ == "__main__":
    try:
        requests.get(API_URL)
        run_benchmark()
    except:
        print("❌ Error: Run 'uvicorn main:app --reload' in another terminal first!")