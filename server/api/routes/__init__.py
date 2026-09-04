from fastapi import APIRouter
from server.api.routes import auth, movies, series, genres

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(movies.router)
api_router.include_router(series.router)
api_router.include_router(genres.router)
