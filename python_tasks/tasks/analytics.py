
"""Analytics processing tasks - Refactored for Enterprise Integrations"""

import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy import func, select, cast, Date

from database import get_session
from orm_models import User, Post, Comment
from repositories import UserRepository

# New Imports for Drift Detection & Snowflake
from config import settings
from integrations.snowflake_adapter import SnowflakeAdapter

logger = logging.getLogger("background_tasks.analytics")

async def process_daily_analytics() -> Dict[str, Any]:
    """
    Process daily analytics, checking for Data Drift, and syncing to Snowflake.
    """
    try:
        async with get_session() as session:
            # 1. Define Range
            yesterday = datetime.now() - timedelta(days=1)
            start_of_day = yesterday.replace(hour=0, minute=0, second=0, microsecond=0)
            end_of_day = yesterday.replace(hour=23, minute=59, second=59, microsecond=999999)
            
            # 2. Daily Counts
            async def count_in_range(model, date_field):
                stmt = select(func.count()).where(
                    date_field.between(start_of_day, end_of_day)
                )
                result = await session.execute(stmt)
                return result.scalar() or 0

            new_users = await count_in_range(User, User.createdAt)
            new_posts = await count_in_range(Post, Post.createdAt)
            
            # 3. Data Drift Detection (Rolling Average 7 Days)
            drift_alert = await check_data_drift(session, User, User.createdAt, new_users, metric_name="New Users")
            
            current_stats = {
                "date": yesterday.strftime("%Y-%m-%d"),
                "new_users": new_users,
                "new_posts": new_posts,
                "drift_alert": drift_alert,
                "processed_at": datetime.now().isoformat()
            }
            
            logger.info(f"Daily Analytics Processed: {current_stats}")

            # 4. Push to Snowflake DW
            # In a real system, this might push the raw new users (redacted) 
            # rather than just the summary stats. Let's demonstrate pushing the summary.
            adapter = SnowflakeAdapter()
            adapter.sync_table(
                table_name="DAILY_METRICS", 
                data=[current_stats],
                key_columns=["date"]
            )
            
            return current_stats

    except Exception as e:
        logger.error(f"Analytics processing error: {e}", exc_info=True)
        return {}


async def check_data_drift(session, model, date_field, current_value: int, metric_name: str) -> Optional[str]:
    """
    Calculates 7-day rolling average and compares with current value.
    Returns an alert string if drift exceeds configured threshold.
    """
    rolling_start = datetime.now() - timedelta(days=8)
    rolling_end = datetime.now() - timedelta(days=1)
    
    # Calculate average of last 7 days excluding today
    # Group by date to get daily counts, then average
    
    stmt = select(
        cast(date_field, Date).label('date'), 
        func.count().label('count')
    ).where(
        date_field.between(rolling_start, rolling_end)
    ).group_by(
        cast(date_field, Date)
    )
    
    result = await session.execute(stmt)
    daily_counts = [row.count for row in result.all()]
    
    if not daily_counts:
        return None # Not enough history

    avg_7d = sum(daily_counts) / len(daily_counts)
    
    if avg_7d == 0:
        return None 

    deviation = abs(current_value - avg_7d) / avg_7d
    
    threshold = settings.DRIFT_THRESHOLD_PERCENT
    
    if deviation > threshold:
        alert_msg = (f"[DRIFT DETECTED] {metric_name}: Current={current_value}, "
                     f"7d_Avg={avg_7d:.2f}, Deviation={deviation:.2%}")
        logger.warning(alert_msg)
        return alert_msg
    
    return None

async def get_engagement_metrics() -> Dict[str, Any]:
    """Calculate engagement metrics"""
    try:
        async with get_session() as session:
            async def get_count(model):
                 return (await session.execute(select(func.count()).select_from(model))).scalar() or 0

            total_users = await get_count(User)
            total_posts = await get_count(Post)
            total_comments = await get_count(Comment)
            
            avg_vote_stmt = select(func.avg(Post.voteScore))
            avg_vote_score = (await session.execute(avg_vote_stmt)).scalar() or 0

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
