
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from typing import Optional, List

# To use ORM models, we need the SQLAlchemy Declarative Objects
# Since models/user.py is a Pydantic model (Schema), we need the SQL Alchemy model.
# Typically, a project has both. 
# Challenge: The user provided Pydantic models in models/, but where are the SQL Alchemy models?
# 
# Assumption: The existing project likely has SQLAlchemy models defined somewhere or we need to define them.
# Looking at "python_tasks/database.py", it defined "Base = declarative_base()".
# But no models were shown in the file structure scan other than maybe inside api/? or implied.
# 
# Wait, "prisma/schema.prisma" exists, which implies Prisma Client usage. But this task is Python.
# In Python, usually one uses `prisma-client-py` OR SQLAlchemy.
# Phase 1: "Define strict Pydantic models... align with Postgres schema".
# Phase 2: "Replace all raw psycopg2 queries with SQLAlchemy ... Implement Repository Pattern".
#
# This implies I likely need to CREATE the SQLAlchemy ORM models if they don't exist, 
# or Map the valid Pydantic models to SQL Core inserts.
# Given "BaseRepository" uses `self.model_class(**attributes)`, it expects an ORM class.
#
# Strategy: I will define minimal SQLAlchemy ORM Models in `python_tasks/orm_models.py` 
# that map to the Tables defined in PrismaSchema, so the Repositories work.

from .base import BaseRepository
# I will create this file next
from orm_models import User as UserORM 

class UserRepository(BaseRepository[UserORM]):
    model_class = UserORM

    async def get_by_email(self, email: str) -> Optional[UserORM]:
        result = await self.session.execute(
            select(UserORM).where(UserORM.email == email)
        )
        return result.scalars().first()

    async def get_active_users_count(self, days: int = 1) -> int:
        # Example of specific business query
        from datetime import datetime, timedelta
        cutoff = datetime.now() - timedelta(days=days)
        result = await self.session.execute(
            select(func.count(UserORM.id)).where(UserORM.lastLoginAt >= cutoff)
        )
        return result.scalar() or 0
