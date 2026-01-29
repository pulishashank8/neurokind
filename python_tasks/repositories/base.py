
from typing import TypeVar, Generic, List, Optional, Type, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, text
from sqlalchemy.orm import selectinload
from pydantic import BaseModel

T = TypeVar("T")

class BaseRepository(Generic[T]):
    model_class: Type[T] = None

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, id: Any) -> Optional[T]:
        """Fetch a single record by ID"""
        result = await self.session.execute(
            select(self.model_class).where(self.model_class.id == id)
        )
        return result.scalars().first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> List[T]:
        """Fetch all records with pagination"""
        result = await self.session.execute(
            select(self.model_class).offset(skip).limit(limit)
        )
        return result.scalars().all()

    async def create(self, attributes: dict) -> T:
        """Create a new record"""
        instance = self.model_class(**attributes)
        self.session.add(instance)
        await self.session.flush() # Populate ID without committing
        return instance

    async def create_many(self, items: List[dict], chunk_size: int = 1000):
        """
        Batch insert records efficiently.
        """
        if not items:
            return
        
        # SQLAlchemy 2.0+ supports bulk insert via execution
        # but for simple ORM objects:
        for i in range(0, len(items), chunk_size):
            chunk = items[i:i + chunk_size]
            # Depending on use case, Core Insert is faster than ORM add_all
            # pure core insert:
            await self.session.run_sync(
                lambda session: session.bulk_insert_mappings(self.model_class, chunk)
            )

    async def update(self, id: Any, attributes: dict) -> Optional[T]:
        """Update a record"""
        instance = await self.get_by_id(id)
        if not instance:
            return None
        
        for key, value in attributes.items():
            setattr(instance, key, value)
        
        return instance

    async def delete(self, id: Any) -> bool:
        """Delete a record"""
        instance = await self.get_by_id(id)
        if instance:
            await self.session.delete(instance)
            return True
        return False
        
    async def execute_raw(self, sql: str, params: dict = None):
        """
        Execute raw SQL safely using parameters.
        Returns a list of dicts.
        """
        result = await self.session.execute(text(sql), params or {})
        return result.mappings().all()
