"""
Top level server entrypoint
Imports and exports FastAPI app from server.app.main
"""

from server.app.main import app

__all__ = ["app"]
