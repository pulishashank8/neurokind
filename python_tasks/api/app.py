"""
NeuroKid Python Backend API
FastAPI-based backend service handling analytics, data governance, and admin features
"""

import os
import logging
from datetime import datetime
from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('python_api')

app = FastAPI(
    title="NeuroKid Python Backend",
    description="Python backend API for analytics, data governance, and admin features",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = datetime.now()
    response = await call_next(request)
    duration = (datetime.now() - start_time).total_seconds() * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration:.2f}ms")
    return response


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"success": False, "error": {"code": "INTERNAL_ERROR", "message": str(exc)}}
    )


from api.routes import users_router, analytics_router, posts_router, governance_router

app.include_router(users_router, prefix="/api/python")
app.include_router(analytics_router, prefix="/api/python")
app.include_router(posts_router, prefix="/api/python")
app.include_router(governance_router, prefix="/api/python")


@app.get("/")
async def root():
    return {
        "service": "NeuroKid Python Backend",
        "version": "1.0.0",
        "status": "healthy",
        "timestamp": datetime.now().isoformat()
    }


@app.get("/health")
async def health_check():
    from api.database import execute_query
    
    try:
        result = execute_query("SELECT 1 as check", fetch_one=True)
        db_status = "connected" if result else "error"
    except Exception as e:
        db_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "database": db_status,
        "timestamp": datetime.now().isoformat()
    }


@app.get("/api/python/stats")
async def api_stats():
    """Get API usage statistics"""
    return {
        "endpoints": {
            "users": "/api/python/users",
            "analytics": "/api/python/analytics",
            "posts": "/api/python/posts",
            "governance": "/api/python/governance"
        },
        "features": [
            "User management and activity tracking",
            "Dashboard analytics and metrics",
            "Content moderation tools",
            "Data governance and GDPR compliance",
            "Audit logging and retention"
        ]
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PYTHON_API_PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port, log_level="info")
