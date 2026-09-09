from fastapi import APIRouter
from server.app.api.v1.zones_router import router as zones_router
from server.app.api.v1.service_requests_router import router as service_requests_router
from server.app.api.v1.citizens_router import router as citizens_router
from server.app.api.v1.health_router import router as health_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(zones_router)
v1_router.include_router(service_requests_router)
v1_router.include_router(citizens_router)
v1_router.include_router(health_router)
