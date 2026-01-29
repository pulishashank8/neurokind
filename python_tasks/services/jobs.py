
from sqlalchemy import text
from database import get_session
import logging
import json
import uuid

logger = logging.getLogger(__name__)

async def run_daily_analytics_etl():
    """
    ETL Job: Extracts raw User activity, Transforms it into significant events,
    and Loads it into a summary structure (or just logs it for this demo).
    """
    job_name = "Daily Analytics Aggregation"
    run_id = str(uuid.uuid4())
    
    async with get_session() as session:
        # 1. Start Job
        await session.execute(text("""
            INSERT INTO "JobExecution" ("id", "jobName", "status", "source", "startedAt")
            VALUES (:id, :name, 'RUNNING', 'PythonETL', NOW())
        """), {"id": run_id, "name": job_name})
        await session.commit()
        
        try:
            # 2. Extract & Transform (Simulated complex SQL aggregation)
            # Count new users, posts, and comments for "Yesterday"
            
            sql = """
                SELECT 
                    (SELECT COUNT(*) FROM "User" WHERE "createdAt" > NOW() - INTERVAL '1 day') as new_users,
                    (SELECT COUNT(*) FROM "Post" WHERE "createdAt" > NOW() - INTERVAL '1 day') as new_posts,
                    (SELECT COUNT(*) FROM "Comment" WHERE "createdAt" > NOW() - INTERVAL '1 day') as new_comments
            """
            result = (await session.execute(text(sql))).fetchone()
            
            # 3. Load / Report
            # In a real ETL, this would go into a Data Warehouse table.
            # Here we update the Job entry with the results in metadata.
            
            processed_count = result[0] + result[1] + result[2]
            metadata = {
                "new_users": result[0],
                "new_posts": result[1],
                "new_comments": result[2],
                "etl_method": "SQL_AGGREGATION_ASYNC"
            }
            
            # 4. Complete Job
            await session.execute(text("""
                UPDATE "JobExecution" 
                SET "status" = 'SUCCESS', 
                    "completedAt" = NOW(), 
                    "recordsProcessed" = :count,
                    "metadata" = :meta
                WHERE "id" = :id
            """), {
                "id": run_id, 
                "count": processed_count, 
                "meta": json.dumps(metadata)
            })
            await session.commit()
            
            return {"status": "success", "data": metadata}
            
        except Exception as e:
            logger.error(f"ETL Job Failed: {e}")
            await session.execute(text("""
                UPDATE "JobExecution" 
                SET "status" = 'FAILED', 
                    "completedAt" = NOW(), 
                    "errorLog" = :error
                WHERE "id" = :id
            """), {"id": run_id, "error": str(e)})
            await session.commit()
            raise e
