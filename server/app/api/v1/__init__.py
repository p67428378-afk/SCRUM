from fastapi import APIRouter
from server.app.api.v1.transfers import router as transfers_router

api_v1_router = APIRouter()
api_v1_router.include_router(transfers_router)
