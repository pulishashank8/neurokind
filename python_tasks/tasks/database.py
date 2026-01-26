"""Database cleanup and maintenance tasks"""

import os
import logging
from datetime import datetime, timedelta

logger = logging.getLogger('background_tasks.database')

def get_database_url():
    """Get database URL from environment"""
    return os.environ.get('DATABASE_URL')

def cleanup_audit_logs(days: int = 365) -> int:
    """Delete audit logs older than specified days"""
    try:
        import psycopg2
        
        db_url = get_database_url()
        if not db_url:
            logger.warning("DATABASE_URL not set")
            return 0
            
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute(
            'DELETE FROM "AuditLog" WHERE "createdAt" < %s',
            (cutoff_date,)
        )
        deleted_count = cursor.rowcount
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Deleted {deleted_count} audit logs older than {days} days")
        return deleted_count
        
    except ImportError:
        logger.error("psycopg2 not installed")
        return 0
    except Exception as e:
        logger.error(f"Database cleanup error: {e}")
        return 0


def cleanup_expired_sessions(days: int = 30) -> int:
    """Clean up expired user sessions"""
    try:
        import psycopg2
        
        db_url = get_database_url()
        if not db_url:
            return 0
            
        cutoff_date = datetime.now() - timedelta(days=days)
        
        conn = psycopg2.connect(db_url)
        cursor = conn.cursor()
        
        cursor.execute(
            'DELETE FROM "Session" WHERE "expires" < %s',
            (cutoff_date,)
        )
        deleted_count = cursor.rowcount
        
        conn.commit()
        cursor.close()
        conn.close()
        
        logger.info(f"Deleted {deleted_count} expired sessions")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Session cleanup error: {e}")
        return 0


def vacuum_database():
    """Run VACUUM ANALYZE on the database"""
    try:
        import psycopg2
        
        db_url = get_database_url()
        if not db_url:
            return False
            
        conn = psycopg2.connect(db_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        cursor.execute('VACUUM ANALYZE')
        
        cursor.close()
        conn.close()
        
        logger.info("Database VACUUM ANALYZE completed")
        return True
        
    except Exception as e:
        logger.error(f"VACUUM error: {e}")
        return False
