"""Analytics API routes with caching for performance"""

from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from api.cache import cached

router = APIRouter(prefix="/analytics", tags=["analytics"])


class DashboardStats(BaseModel):
    total_users: int
    total_posts: int
    total_comments: int
    total_votes: int
    new_users_7d: int
    active_users_24h: int


class ActivityPoint(BaseModel):
    date: date
    posts: int
    comments: int
    new_users: int


class ContributorStats(BaseModel):
    id: str
    username: Optional[str] = None
    displayName: Optional[str] = None
    postCount: int
    commentCount: int
    totalScore: int


class EngagementMetrics(BaseModel):
    posts_per_user: float
    comments_per_post: float
    avg_vote_score: float
    engagement_rate: float


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats():
    """Get main dashboard statistics (cached for 60 seconds)"""
    from api.database import AnalyticsRepository
    return _get_cached_dashboard_stats()

@cached(ttl=60, key_prefix="analytics")
def _get_cached_dashboard_stats():
    from api.database import AnalyticsRepository
    return AnalyticsRepository.get_dashboard_stats()


@router.get("/timeline", response_model=List[ActivityPoint])
async def get_activity_timeline(days: int = Query(30, ge=1, le=90)):
    """Get activity timeline for the last N days"""
    from api.database import AnalyticsRepository
    return AnalyticsRepository.get_activity_timeline(days=days)


@router.get("/top-contributors", response_model=List[ContributorStats])
async def get_top_contributors(limit: int = Query(10, ge=1, le=50)):
    """Get top contributors by activity"""
    from api.database import AnalyticsRepository
    return AnalyticsRepository.get_top_contributors(limit=limit)


@router.get("/engagement")
async def get_engagement_metrics():
    """Get engagement metrics"""
    from api.database import execute_query
    
    stats = {}
    
    result = execute_query('SELECT COUNT(*) as count FROM "User"', fetch_one=True)
    total_users = result['count'] if result else 1
    
    result = execute_query('SELECT COUNT(*) as count FROM "Post"', fetch_one=True)
    total_posts = result['count'] if result else 0
    
    result = execute_query('SELECT COUNT(*) as count FROM "Comment"', fetch_one=True)
    total_comments = result['count'] if result else 0
    
    result = execute_query('SELECT AVG("voteScore") as avg FROM "Post"', fetch_one=True)
    avg_vote = result['avg'] if result and result['avg'] else 0
    
    result = execute_query('''
        SELECT COUNT(*) as count FROM "User" 
        WHERE "lastLoginAt" > NOW() - INTERVAL '30 days'
    ''', fetch_one=True)
    active_users = result['count'] if result else 0
    
    return {
        "posts_per_user": round(total_posts / max(total_users, 1), 2),
        "comments_per_post": round(total_comments / max(total_posts, 1), 2),
        "avg_vote_score": round(float(avg_vote), 2),
        "engagement_rate": round((active_users / max(total_users, 1)) * 100, 2),
        "total_users": total_users,
        "active_users_30d": active_users
    }


@router.get("/categories")
async def get_category_stats():
    """Get statistics by category"""
    from api.database import execute_query
    
    query = '''
        SELECT c.id, c.name, c.slug,
               COUNT(p.id) as "postCount",
               COALESCE(SUM(p."voteScore"), 0) as "totalVotes"
        FROM "Category" c
        LEFT JOIN "Post" p ON c.id = p."categoryId"
        GROUP BY c.id, c.name, c.slug
        ORDER BY "postCount" DESC
    '''
    return execute_query(query)


@router.get("/growth")
async def get_growth_metrics():
    """Get user and content growth metrics"""
    from api.database import execute_query
    
    users_by_month = execute_query('''
        SELECT DATE_TRUNC('month', "createdAt") as month,
               COUNT(*) as count
        FROM "User"
        WHERE "createdAt" > NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
    ''')
    
    posts_by_month = execute_query('''
        SELECT DATE_TRUNC('month', "createdAt") as month,
               COUNT(*) as count
        FROM "Post"
        WHERE "createdAt" > NOW() - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', "createdAt")
        ORDER BY month DESC
    ''')
    
    return {
        "users_by_month": users_by_month,
        "posts_by_month": posts_by_month
    }
