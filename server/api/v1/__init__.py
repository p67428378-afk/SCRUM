from fastapi import APIRouter
from server.api.v1.transfers import router as transfers_router
from server.api.v1.accounts import router as accounts_router

api_v1_router = APIRouter()
api_v1_router.include_router(transfers_router, prefix="/transfers", tags=["transfers"])
api_v1_router.include_router(accounts_router, prefix="/accounts", tags=["accounts"])

__all__ = ["api_v1_router"]
