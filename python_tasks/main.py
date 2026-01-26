#!/usr/bin/env python3
"""
NeuroKid Background Tasks Service
Handles scheduled and async background jobs like:
- Email notifications
- Data cleanup
- Analytics processing
- Report generation
"""

import os
import sys
import time
import signal
import logging
from datetime import datetime
from typing import Callable, Dict, Any
import threading
import schedule

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('background_tasks')

shutdown_flag = threading.Event()

def signal_handler(signum, frame):
    logger.info("Shutdown signal received")
    shutdown_flag.set()

signal.signal(signal.SIGTERM, signal_handler)
signal.signal(signal.SIGINT, signal_handler)


class TaskRunner:
    def __init__(self):
        self.tasks: Dict[str, Callable] = {}
        
    def register(self, name: str, func: Callable):
        self.tasks[name] = func
        logger.info(f"Registered task: {name}")
        
    def run_task(self, name: str, **kwargs) -> Any:
        if name not in self.tasks:
            logger.error(f"Task not found: {name}")
            return None
        try:
            logger.info(f"Running task: {name}")
            result = self.tasks[name](**kwargs)
            logger.info(f"Task completed: {name}")
            return result
        except Exception as e:
            logger.error(f"Task failed: {name} - {e}")
            raise


runner = TaskRunner()


def cleanup_old_audit_logs():
    """Clean up audit logs older than 365 days"""
    logger.info("Running audit log cleanup...")
    try:
        from tasks.database import cleanup_audit_logs
        deleted_count = cleanup_audit_logs(days=365)
        logger.info(f"Deleted {deleted_count} old audit log entries")
    except Exception as e:
        logger.error(f"Audit log cleanup failed: {e}")


def process_analytics():
    """Process user analytics data"""
    logger.info("Processing analytics...")
    try:
        from tasks.analytics import process_daily_analytics
        process_daily_analytics()
        logger.info("Analytics processing completed")
    except Exception as e:
        logger.error(f"Analytics processing failed: {e}")


def send_pending_notifications():
    """Send pending email notifications"""
    logger.info("Sending pending notifications...")
    try:
        from tasks.notifications import send_pending_emails
        sent_count = send_pending_emails()
        logger.info(f"Sent {sent_count} notifications")
    except Exception as e:
        logger.error(f"Notification sending failed: {e}")


def health_check():
    """Simple health check task"""
    logger.info(f"Health check at {datetime.now().isoformat()}")
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


runner.register("cleanup_audit_logs", cleanup_old_audit_logs)
runner.register("process_analytics", process_analytics)
runner.register("send_notifications", send_pending_notifications)
runner.register("health_check", health_check)


def setup_schedule():
    """Set up scheduled tasks"""
    schedule.every().day.at("02:00").do(cleanup_old_audit_logs)
    schedule.every().day.at("03:00").do(process_analytics)
    schedule.every(15).minutes.do(send_pending_notifications)
    schedule.every(5).minutes.do(health_check)
    logger.info("Scheduled tasks configured")


def run_scheduler():
    """Main scheduler loop"""
    logger.info("Starting background task scheduler...")
    setup_schedule()
    
    while not shutdown_flag.is_set():
        schedule.run_pending()
        time.sleep(1)
    
    logger.info("Scheduler stopped")


if __name__ == "__main__":
    logger.info("NeuroKid Background Tasks Service starting...")
    
    health_check()
    
    try:
        run_scheduler()
    except KeyboardInterrupt:
        logger.info("Interrupted by user")
    finally:
        logger.info("Background Tasks Service stopped")
