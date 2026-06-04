
from pydantic_settings import BaseSettings
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Simple Todo App"
    API_V1_STR: str = "/api/v1"
    
    # The data directory is relative to the 'app' directory
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data")
    TODOS_FILE: str = os.path.join(DATA_DIR, "todos.csv")

settings = Settings()
