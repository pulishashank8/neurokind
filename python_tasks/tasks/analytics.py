"""Analytics processing tasks"""

import os
import logging
from datetime import datetime, timedelta
from typing import Dict, Any

logger = logging.getLogger('background_tasks.analytics')

def get_database_url():
    return os.environ.get('DATABASE_URL')

def process_daily_analytics() -> Dict[str, Any]:
    """Process and aggregate daily analytics"""
    try:
        import psycopg2
        
        db_url = get_database_url()
        if not db_url:
            logger.warning("DATABASE_URL not set")
            return {}
            
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        yesterday = datetime.now() - timedelta(days=1)
        start_of_day = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
        end_of_day = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
        
        cursor.execute(
            'SELECT COUNT(*) FROM "User" WHERE "createdAt" BETWEEN %s AND %s',
            (start_of_day, end_of_day)
        )
        new_users = cursor.fetchone()[0]
        
        cursor.execute(
            'SELECT COUNT(*) FROM "Post" WHERE "createdAt" BETWEEN %s AND %s',
            (start_of_day, end_of_day)
        )
        new_posts = cursor.fetchone()[0]
        
        cursor.execute(
            'SELECT COUNT(*) FROM "Comment" WHERE "createdAt" BETWEEN %s AND %s',
            (start_of_day, end_of_day)
        )
        new_comments = cursor.fetchone()[0]
        
        cursor.execute(
            'SELECT COUNT(*) FROM "User" WHERE "lastLoginAt" BETWEEN %s AND %s',
            (start_of_day, end_of_day)
        )
        active_users = cursor.fetchone()[0]
        
        cursor.close()
        conn.close()
        
        analytics = {
            "date": yesterday.strftime("%Y-%m-%d"),
            "new_users": new_users,
            "new_posts": new_posts,
            "new_comments": new_comments,
            "active_users": active_users,
            "processed_at": datetime.now().isoformat()
        }
        
        logger.info(f"Daily analytics: {analytics}")
        return analytics
        
    except ImportError:
        logger.error("psycopg2 not installed")
        return {}
    except Exception as e:
        logger.error(f"Analytics processing error: {e}")
        return {}


def get_engagement_metrics() -> Dict[str, Any]:
    """Calculate engagement metrics"""
    try:
        import psycopg2
        
        db_url = get_database_url()
        if not db_url:
            return {}
            
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute('SELECT COUNT(*) FROM "User"')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM "Post"')
        total_posts = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM "Comment"')
        total_comments = cursor.fetchone()[0]
        
        cursor.execute('SELECT AVG("voteScore") FROM "Post"')
        avg_vote_score = cursor.fetchone()[0] or 0
        
        cursor.close()
        conn.close()
        
        return {
            "total_users": total_users,
            "total_posts": total_posts,
            "total_comments": total_comments,
            "avg_vote_score": float(avg_vote_score),
            "posts_per_user": total_posts / max(total_users, 1),
            "comments_per_post": total_comments / max(total_posts, 1)
        }
        
    except Exception as e:
        logger.error(f"Engagement metrics error: {e}")
        return {}
