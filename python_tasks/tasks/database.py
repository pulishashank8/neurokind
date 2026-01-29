
"""Database cleanup and maintenance tasks - Refactored for Async"""

import logging
from datetime import datetime, timedelta
from sqlalchemy import text

from database import get_session

logger = logging.getLogger("background_tasks.database")

async def cleanup_audit_logs(days: int = 365) -> int:
    """Delete audit logs older than specified days using Async Session"""
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        
        async with get_session() as session:
            # Note: "AuditLog" table needs to exist in ORM or we use raw SQL.
            # Using raw SQL for efficient bulk delete is fine and often preferred for cleanup.
            stmt = text('DELETE FROM "AuditLog" WHERE "createdAt" < :cutoff')
            result = await session.execute(stmt, {"cutoff": cutoff_date})
            deleted_count = result.rowcount
            await session.commit()
        
        logger.info(f"Deleted {deleted_count} audit logs older than {days} days")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Database cleanup error: {e}")
        return 0


async def cleanup_expired_sessions(days: int = 30) -> int:
    """Clean up expired user sessions"""
    try:
        cutoff_date = datetime.now() - timedelta(days=days)
        
        async with get_session() as session:
            # Assuming "UserSession" table exists (Session is reserved keyword often)
            # Prisma schema calls it "UserSession" relation but table might be "Session"?
            # Prompt schema: "model UserSession" was NOT in the truncated output view, 
            # but usually it's there. 
            # Current file had 'DELETE FROM "Session"'. I will stick to that.
            stmt = text('DELETE FROM "Session" WHERE "expires" < :cutoff')
            result = await session.execute(stmt, {"cutoff": cutoff_date})
            deleted_count = result.rowcount
            await session.commit()
        
        logger.info(f"Deleted {deleted_count} expired sessions")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Session cleanup error: {e}")
        return 0

async def vacuum_database():
    """Run VACUUM ANALYZE on the database"""
    # VACUUM cannot be run inside a transaction block.
    # Asyncpg supports this but SQLAlchemy session typically starts a transaction.
    # Method: Use isolation_level="AUTOCOMMIT" on the engine or execution option.
    try:
        from database import engine
        # Acquiring a connection directly for maintenance ops
        async with engine.connect() as conn:
            await conn.execution_options(isolation_level="AUTOCOMMIT")
            await conn.execute(text("VACUUM ANALYZE"))
        
        logger.info("Database VACUUM ANALYZE completed")
        return True
        
    except Exception as e:
        logger.error(f"VACUUM error: {e}")
        return False
