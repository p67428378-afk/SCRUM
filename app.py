"""Cloud Run entry point module exposing the FastAPI application on port 8080."""
import os
import uvicorn
from server.main import app

if __name__ == "__main__":
    port = int(os.getenv("PORT", "8080"))
    uvicorn.run("server.main:app", host="0.0.0.0", port=port, reload=False)
