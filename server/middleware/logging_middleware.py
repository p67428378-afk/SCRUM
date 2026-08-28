from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from jose import jwt
from server.database import SessionLocal
from server.models.models import UserActivityLog
from server.dependencies.auth import SECRET_KEY, ALGORITHM


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        user_id = None
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:]
            try:
                payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
                user_id = payload.get("sub")
            except Exception:
                pass

        response = await call_next(request)

        if request.url.path.startswith("/api/v1"):
            client_ip = request.client.host if request.client else "unknown"
            try:
                if hasattr(request.app.state, "test_db") and request.app.state.test_db:
                    db = request.app.state.test_db
                    log_entry = UserActivityLog(
                        user_id=user_id,
                        activity_type=f"{request.method} {request.url.path}",
                        endpoint=request.url.path,
                        ip_address=client_ip,
                        details=f"Status Code: {response.status_code}",
                    )
                    db.add(log_entry)
                    db.commit()
                else:
                    db = SessionLocal()
                    log_entry = UserActivityLog(
                        user_id=user_id,
                        activity_type=f"{request.method} {request.url.path}",
                        endpoint=request.url.path,
                        ip_address=client_ip,
                        details=f"Status Code: {response.status_code}",
                    )
                    db.add(log_entry)
                    db.commit()
                    db.close()
            except Exception:
                pass

        return response
