import unittest
from unittest.mock import MagicMock, patch
import sys
import os
import pandas as pd

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.recommendation_engine import RecommenderSystem

class TestRecommenderSystem(unittest.TestCase):
    """
    Unit Verification for Recommendation Engine.
    
    Validates the system's ability to:
    1. Initialize the SVD (Singular Value Decomposition) model correctly under 'Cold Start' conditions.
    2. Fallback gracefully to synthetic/random data when the database is empty or unreachable.
    3. Return strictly typed, valid recommendation IDs for the frontend.
    """

    @patch('services.recommendation_engine.create_client')
    @patch.dict(os.environ, {"SUPABASE_URL": "https://fake.supabase.co", "SUPABASE_KEY": "fake_key"})
    def setUp(self, mock_create_client):
        """
        Test Harness Setup.
        Configures a mock Supabase client to simulate database responses without network calls.
        
        Mocking Strategy:
        - 'user_interactions': Returns empty list [] to force the Cold Start logic path.
        - 'sounds': Returns a static list of 5 test sounds to validate ID retrieval.
        - Recommender Singleton: Reset before each test to ensure isolation.
        """
        self.mock_sounds = [
            {'id': 'sound_1', 'title': 'Rain'},
            {'id': 'sound_2', 'title': 'Thunder'},
            {'id': 'sound_3', 'title': 'Wind'},
            {'id': 'sound_4', 'title': 'Ocean'},
            {'id': 'sound_5', 'title': 'Fire'},
        ]
        
        self.mock_supabase = MagicMock()
        
        def side_effect_table(table_name):
            query_mock = MagicMock()
            if table_name == "user_interactions":
                query_mock.select.return_value.execute.return_value.data = []
            elif table_name == "sounds":
                query_mock.select.return_value.execute.return_value.data = self.mock_sounds
            return query_mock

        self.mock_supabase.table.side_effect = side_effect_table
        mock_create_client.return_value = self.mock_supabase

        RecommenderSystem._instance = None
        self.recommender = RecommenderSystem.get_instance()

    def test_initialization(self):
        """Verifies that the SVD model successfully trains using fallback logic when active data is missing."""
        print("\n🧪 Testing Initialization...")
        self.assertIsNotNone(self.recommender.model, "SVD Model should be trained (Synthetic Fallback)")
        self.assertIsNotNone(self.recommender.user_item_matrix, "User-Item Matrix should exist")
        print("✅ Initialization Passed")

    def test_recommendation_format(self):
        """Verifies that recommendations are returned as a list of string IDs compliant with frontend expectations."""
        print("\n🧪 Testing Recommendation Format...")
        recommendations = self.recommender.recommend_for_sound('sound_1', top_k=2)
        
        self.assertIsInstance(recommendations, list)
        self.assertTrue(len(recommendations) > 0, "Should return recommendations")
        self.assertIsInstance(recommendations[0], str, "Recommendation should be a string ID")
        print("✅ Format Passed")

    def test_unknown_sound_fallback(self):
        """Verifies the system's robustness when handling requests for non-existent or unknown sound IDs."""
        print("\n🧪 Testing Fallback Logic...")
        recommendations = self.recommender.recommend_for_sound('sound_999')
        
        self.assertTrue(len(recommendations) > 0, "Fallback should return random sounds")
        self.assertNotEqual(recommendations[0], 'sound_999', "Should not recommend itself")
        print("✅ Fallback Passed")

if __name__ == '__main__':
    unittest.main()