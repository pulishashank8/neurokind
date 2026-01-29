
"""Notification and email tasks - Refactored for Async Repository Pattern"""


import os
import logging
import requests
from typing import List, Dict, Any
from database import get_session
from repositories import NotificationRepository

logger = logging.getLogger('background_tasks.notifications')

def get_resend_api_key():
    return os.environ.get('RESEND_API_KEY')

async def send_pending_emails() -> int:

    """Send pending email notifications"""
    try:
        async with get_session() as session:
            repo = NotificationRepository(session)
            
            pending = await repo.get_pending_notifications(limit=100)
            
            if not pending:
                logger.info("No pending notifications")
                return 0
                
            sent_count = 0
            for notification in pending:
                try:
                    # In a real app we'd construct the email from the payload
                    # For now just marking as read to simulate processing
                    
                    await repo.mark_as_read(notification.id)
                    sent_count += 1
                    
                except Exception as e:
                    logger.error(f"Failed to process notification {notification.id}: {e}")
            
            await session.commit()
            
            logger.info(f"Processed {sent_count} notifications")
            return sent_count
            
    except Exception as e:
        logger.error(f"Notification processing error: {e}")
        return 0


def send_email(to: str, subject: str, html_body: str) -> bool:
    """Send an email using Resend API (Synchronous for now)"""
    try:
        
        api_key = get_resend_api_key()
        if not api_key:
            logger.warning("RESEND_API_KEY not set")
            return False
            
        response = requests.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            },
            json={
                "from": "NeuroKid <noreply@neurokid.help>",
                "to": [to],
                "subject": subject,
                "html": html_body
            }
        )
        
        if response.status_code == 200:
            logger.info(f"Email sent to {to}")
            return True
        else:
            logger.error(f"Email failed: {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"Email error: {e}")
        return False


def send_digest_emails() -> int:
    """Send daily/weekly digest emails to users"""
    logger.info("Digest email sending not yet implemented")
    return 0
