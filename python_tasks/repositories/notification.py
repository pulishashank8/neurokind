
from .base import BaseRepository
from orm_models import Notification as NotificationORM
from sqlalchemy import select, update
from sqlalchemy.sql import func
import datetime

class NotificationRepository(BaseRepository[NotificationORM]):
    model_class = NotificationORM
    
    async def get_pending_notifications(self, limit: int = 100):
        cutoff = datetime.datetime.now() - datetime.timedelta(hours=24)
        stmt = select(NotificationORM).where(
            NotificationORM.readAt == None,
            NotificationORM.createdAt > cutoff
        ).limit(limit)
        
        result = await self.session.execute(stmt)
        return result.scalars().all()
    
    async def mark_as_read(self, notification_id: str):
        stmt = update(NotificationORM).where(
            NotificationORM.id == notification_id
        ).values(readAt=func.now())
        await self.session.execute(stmt)
