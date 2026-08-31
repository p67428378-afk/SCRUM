from fastapi import APIRouter
from server.api.v1.auth import router as auth_router
from server.api.v1.projects import router as projects_router
from server.api.v1.tasks import router as tasks_router
from server.api.v1.comments import router as comments_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(projects_router)
api_v1_router.include_router(tasks_router)
api_v1_router.include_router(comments_router)

__all__ = ["api_v1_router"]
