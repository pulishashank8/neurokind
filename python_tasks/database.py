
import os
import logging
from typing import AsyncGenerator
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker, AsyncEngine
from sqlalchemy.orm import declarative_base
from sqlalchemy.pool import AsyncAdaptedQueuePool
from dotenv import load_dotenv

# Load environment variables
load_dotenv(override=True)

logger = logging.getLogger("db_service")

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables")

# 1. Transform URL for Asyncpg
# SQLAlchemy async requires 'postgresql+asyncpg://'
if DATABASE_URL.startswith("postgresql://") or DATABASE_URL.startswith("postgres://"):
    ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)
    ASYNC_DATABASE_URL = ASYNC_DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
else:
    ASYNC_DATABASE_URL = DATABASE_URL

# 2. Handle connection parameters (pgbouncer removal and sslmode conversion for asyncpg)
if "?" in ASYNC_DATABASE_URL:
    try:
        base_url, query_str = ASYNC_DATABASE_URL.split("?", 1)
        # Remove incompatible pgbouncer args if present
        if "pgbouncer=true" in query_str:
            query_str = query_str.replace("pgbouncer=true", "")
        if "pgbouncer=false" in query_str:
            query_str = query_str.replace("pgbouncer=false", "")

        # Convert sslmode to ssl for asyncpg compatibility
        # asyncpg uses 'ssl' parameter instead of 'sslmode'
        if "sslmode=" in query_str:
            import re
            sslmode_match = re.search(r'sslmode=(\w+)', query_str)
            if sslmode_match:
                sslmode_value = sslmode_match.group(1)
                query_str = re.sub(r'sslmode=\w+', f'ssl={sslmode_value}', query_str)

        query_str = query_str.replace("&&", "&").strip("&")

        if query_str:
            ASYNC_DATABASE_URL = f"{base_url}?{query_str}"
        else:
            ASYNC_DATABASE_URL = base_url
    except Exception:
        pass

# 3. Create Async Engine with Production Pool Settings
engine: AsyncEngine = create_async_engine(
    ASYNC_DATABASE_URL,
    echo=False,  # Set to True for debugging SQL
    future=True,
    poolclass=AsyncAdaptedQueuePool,
    pool_size=20,           # Scale for concurrency
    max_overflow=10,        # Allow spikes
    pool_timeout=30,        # Fail fast-ish
    pool_pre_ping=True,     # Validates connection before checkout
)

# 4. Session Factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

# 5. Dependency / Context Manager
async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    FastAPI Dependency for DB Session.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()

# Context manager for background tasks/scripts
@asynccontextmanager
async def get_session() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
