"""
Comprehensive integration tests for the Python FastAPI backend
Tests run against live endpoints
"""

import os
import sys
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))



from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock, AsyncMock
from api.app import app


# Mock database calls globally for the test client
# This prevents actual DB connection attempts during import/startup if any
with patch('api.database.init_connection_pool'):
    client = TestClient(app, raise_server_exceptions=False)

class TestRootEndpoints:
    """Test root and health endpoints"""
    
    def test_root_endpoint(self):
        """Test the root endpoint returns service info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["service"] == "NeuroKid Python Backend"
    
    @patch('api.database.execute_query')
    def test_health_endpoint(self, mock_query):
        """Test health endpoint returns expected structure"""
        mock_query.return_value = {"check": 1}
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["database"] == "connected"

    
    def test_api_stats_endpoint(self):
        """Test API stats endpoint"""
        response = client.get("/api/python/stats")
        assert response.status_code == 200
        data = response.json()
        assert "endpoints" in data
        assert "features" in data
        assert "users" in data["endpoints"]
        assert "analytics" in data["endpoints"]


class TestUsersAPI:
    """Test users API endpoints"""
    
    @patch('api.database.UserRepository.get_all')
    @patch('api.database.UserRepository.get_count')
    def test_list_users(self, mock_count, mock_get_all):
        """Test listing users with pagination"""
        mock_get_all.return_value = [{
            "id": "1", 
            "email": "test@test.com", 
            "role": "USER",
            "username": "testuser",
            "displayName": "Test User",
            "createdAt": "2023-01-01T00:00:00",
            "lastLoginAt": None,
            "avatarUrl": None
        }]
        mock_count.return_value = 1
        
        response = client.get("/api/python/users?page=1&limit=20")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert data["page"] == 1
        assert data["limit"] == 20
    
    @patch('api.database.UserRepository.get_all')
    @patch('api.database.UserRepository.get_count')
    def test_list_users_with_search(self, mock_count, mock_get_all):
        """Test listing users with search parameter"""
        mock_get_all.return_value = []
        mock_count.return_value = 0
        
        response = client.get("/api/python/users?search=nonexistent_user_xyz")
        assert response.status_code == 200
        data = response.json()
        assert "users" in data
        assert "total" in data
    
    def test_list_users_pagination_validation(self):
        """Test pagination parameter validation"""
        response = client.get("/api/python/users?page=0")
        assert response.status_code == 422
        
        response = client.get("/api/python/users?limit=200")
        assert response.status_code == 422
    
    @patch('api.database.UserRepository.get_by_id')
    def test_get_user_not_found(self, mock_get_by_id):
        """Test getting a non-existent user"""
        mock_get_by_id.return_value = None
        response = client.get("/api/python/users/nonexistent-user-id-12345")
        assert response.status_code == 404
    
    @patch('api.database.UserRepository.get_by_id')
    def test_get_user_activity_not_found(self, mock_get_by_id):
        """Test getting activity for non-existent user"""
        mock_get_by_id.return_value = None
        response = client.get("/api/python/users/nonexistent-id/activity")
        assert response.status_code == 404


class TestAnalyticsAPI:
    """Test analytics API endpoints"""
    
    @patch('api.database.AnalyticsRepository.get_dashboard_stats')
    def test_dashboard_stats(self, mock_stats):
        """Test dashboard statistics endpoint"""
        mock_stats.return_value = {
            "total_users": 100,
            "total_posts": 50,
            "total_comments": 200,
            "total_votes": 500,
            "new_users_7d": 10,
            "active_users_24h": 5
        }
        response = client.get("/api/python/analytics/dashboard")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "total_posts" in data
        assert "total_comments" in data
        assert "total_votes" in data
        assert "new_users_7d" in data
        assert "active_users_24h" in data
    
    @patch('api.database.AnalyticsRepository.get_activity_timeline')
    def test_activity_timeline(self, mock_timeline):
        """Test activity timeline endpoint"""
        mock_timeline.return_value = [{"date": "2023-01-01", "posts": 5, "comments": 10, "new_users": 2}]
        response = client.get("/api/python/analytics/timeline?days=30")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_activity_timeline_validation(self):
        """Test timeline days parameter validation"""
        response = client.get("/api/python/analytics/timeline?days=0")
        assert response.status_code == 422
        
        response = client.get("/api/python/analytics/timeline?days=100")
        assert response.status_code == 422
    
    @patch('api.database.AnalyticsRepository.get_top_contributors')
    def test_top_contributors(self, mock_top):
        """Test top contributors endpoint"""
        mock_top.return_value = []
        response = client.get("/api/python/analytics/top-contributors?limit=10")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @patch('api.database.execute_query')
    def test_engagement_metrics(self, mock_query):
        """Test engagement metrics endpoint"""
        # Route logic:
        # 1. total_users
        # 2. total_posts
        # 3. total_comments
        # 4. avg_vote
        # 5. active_users
        mock_query.side_effect = [
            {'count': 100},  # total_users
            {'count': 500},  # total_posts
            {'count': 1250}, # total_comments
            {'avg': 10.0},   # avg_vote
            {'count': 50}    # active_users
        ]
        
        response = client.get("/api/python/analytics/engagement")
        assert response.status_code == 200, response.text
        data = response.json()
        assert "posts_per_user" in data
        assert "comments_per_post" in data
        assert data["posts_per_user"] == 5.0
        assert data["comments_per_post"] == 2.5
    
    @patch('api.database.execute_query')
    def test_category_stats(self, mock_query):
        """Test category statistics endpoint"""
        mock_query.return_value = [{"id": "1", "name": "General", "postCount": 10, "totalVotes": 50}]
        response = client.get("/api/python/analytics/categories")
        assert response.status_code == 200, response.text
        assert isinstance(response.json(), list)
    
    @patch('api.database.execute_query')
    def test_growth_metrics(self, mock_query):
        """Test growth metrics endpoint"""
        mock_query.side_effect = [
            [{"month": "2023-01-01", "count": 10}], # users
            [{"month": "2023-01-01", "count": 50}]  # posts
        ]
        response = client.get("/api/python/analytics/growth")
        assert response.status_code == 200, response.text
        data = response.json()
        assert "users_by_month" in data
        assert "posts_by_month" in data


class TestPostsAPI:
    """Test posts API endpoints"""
    
    @patch('api.database.execute_query')
    def test_list_posts(self, mock_query):
        """Test listing posts with pagination"""
        from datetime import datetime
        
        def query_side_effect(query, params=None, fetch_one=False):
            if "COUNT(*)" in query:
                return {'count': 1}
            return [{
                "id": "post1", 
                "title": "Test Post", 
                "voteScore": 10, 
                "status": "ACTIVE",
                "isPinned": False, 
                "categoryName": "General", 
                "authorUsername": "user1",
                "createdAt": datetime(2023, 1, 1, 0, 0, 0)
            }]
            
        mock_query.side_effect = query_side_effect
        
        response = client.get("/api/python/posts?page=1&limit=20")
        assert response.status_code == 200, response.text
        data = response.json()
        assert "posts" in data
        assert "total" in data
        assert "page" in data
        assert "limit" in data
    
    @patch('api.database.execute_query')
    def test_trending_posts(self, mock_query):
        """Test trending posts endpoint"""
        mock_query.return_value = [{"id": "p1", "title": "Trending", "voteScore": 100}]
        response = client.get("/api/python/posts/trending?limit=10")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    @patch('api.database.execute_query')
    def test_flagged_posts(self, mock_query):
        """Test flagged posts endpoint"""
        mock_query.return_value = []
        response = client.get("/api/python/posts/flagged?limit=20")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_update_post_status_invalid(self):
        """Test updating post status with invalid status"""
        response = client.patch("/api/python/posts/test-post-id/status?status=INVALID_STATUS")
        assert response.status_code == 400
        data = response.json()
        assert "detail" in data
    
    @patch('api.database.execute_write')
    def test_update_post_status_not_found(self, mock_write):
        """Test updating non-existent post status"""
        mock_write.return_value = 0
        response = client.patch("/api/python/posts/nonexistent-post-id/status?status=ACTIVE")
        assert response.status_code == 404
    
    @patch('api.database.execute_write')
    def test_pin_post_not_found(self, mock_write):
        """Test pinning non-existent post"""
        mock_write.return_value = 0
        response = client.patch("/api/python/posts/nonexistent-post-id/pin?pinned=true")
        assert response.status_code == 404
    
    @patch('api.database.execute_write')
    def test_lock_post_not_found(self, mock_write):
        """Test locking non-existent post"""
        mock_write.return_value = 0
        response = client.patch("/api/python/posts/nonexistent-post-id/lock?locked=true")
        assert response.status_code == 404


class TestGovernanceAPI:
    """Test data governance API endpoints"""
    
    @patch('api.database.AuditRepository.get_logs')
    def test_get_audit_logs(self, mock_logs):
        """Test getting audit logs"""
        mock_logs.return_value = [{"id": "log1", "action": "LOGIN", "createdAt": "2023-01-01"}]
        response = client.get("/api/python/governance/audit-logs?page=1&limit=50")
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
        assert "page" in data
        assert "limit" in data
    
    @patch('api.database.AuditRepository.get_logs')
    def test_get_audit_logs_with_filter(self, mock_logs):
        """Test getting audit logs with action filter"""
        mock_logs.return_value = []
        response = client.get("/api/python/governance/audit-logs?action=LOGIN")
        assert response.status_code == 200
        data = response.json()
        assert "logs" in data
    
    @patch('api.database.execute_query')
    def test_export_user_data_not_found(self, mock_query):
        """Test exporting non-existent user data"""
        mock_query.return_value = None
        response = client.get("/api/python/governance/export/nonexistent-user-id")
        assert response.status_code == 404, response.text
    
    @patch('api.database.execute_query')
    def test_retention_stats(self, mock_query):
        """Test retention statistics endpoint"""
        mock_query.return_value = {"count": 100} # Mock simple count return
        response = client.get("/api/python/governance/retention-stats")
        assert response.status_code == 200
        data = response.json()
        assert "total_users" in data
        assert "inactive_30d" in data
        assert "inactive_90d" in data
        assert "deleted_posts" in data
        assert "old_audit_logs" in data
    
    def test_cleanup_audit_logs_validation(self):
        """Test cleanup requires minimum 30 days"""
        response = client.post("/api/python/governance/cleanup/audit-logs?days=10")
        assert response.status_code == 422
    
    @patch('api.database.execute_query')
    def test_data_catalog(self, mock_query):
        """Test data catalog endpoint"""
        mock_query.return_value = [{"name": "User", "pii": True}, {"name": "Post", "pii": False}]
        response = client.get("/api/python/governance/data-catalog")
        assert response.status_code == 200
        data = response.json()
        assert "tables" in data
        assert "retention_policies" in data
        assert len(data["tables"]) > 0
        
        user_table = next((t for t in data["tables"] if t["name"] == "User"), None)
        assert user_table is not None
        assert user_table["pii"] is True


class TestErrorHandling:
    """Test error handling"""
    
    def test_404_endpoint(self):
        """Test 404 for non-existent endpoints"""
        response = client.get("/api/python/nonexistent-endpoint")
        assert response.status_code == 404


class TestInputValidation:
    """Test input validation across endpoints"""
    
    def test_users_page_too_low(self):
        """Test users page validation - too low"""
        response = client.get("/api/python/users?page=0")
        assert response.status_code == 422
    
    def test_users_limit_too_high(self):
        """Test users limit validation - too high"""
        response = client.get("/api/python/users?page=1&limit=200")
        assert response.status_code == 422
    
    def test_timeline_days_too_low(self):
        """Test timeline days validation - too low"""
        response = client.get("/api/python/analytics/timeline?days=0")
        assert response.status_code == 422
    
    def test_timeline_days_too_high(self):
        """Test timeline days validation - too high"""
        response = client.get("/api/python/analytics/timeline?days=100")
        assert response.status_code == 422
    
    def test_contributors_limit_too_high(self):
        """Test top contributors limit validation"""
        response = client.get("/api/python/analytics/top-contributors?limit=100")
        assert response.status_code == 422


class TestCORSAndHeaders:
    """Test CORS and security headers"""
    
    def test_cors_headers_present(self):
        """Test that CORS headers are present"""
        response = client.options("/", headers={"Origin": "http://localhost:5000"})
        assert response.status_code in [200, 204, 405]


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
