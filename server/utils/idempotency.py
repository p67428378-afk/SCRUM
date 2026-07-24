import threading

from fastapi import Header, HTTPException, status

# Thread-safe in-memory store for idempotency keys
# Key: idempotency_key (str), Value: dict with status ('processing' or 'completed') and response_data
_idempotency_store = {}
_lock = threading.Lock()


def check_idempotency(idempotency_key: str = Header(None, alias="Idempotency-Key")):
    if not idempotency_key:
        return None

    with _lock:
        if idempotency_key in _idempotency_store:
            record = _idempotency_store[idempotency_key]
            if record["status"] == "processing":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="A request with this idempotency key is already in progress.",
                )
            elif record["status"] == "completed":
                # Return the cached response
                return record["response"]
        else:
            # Mark as processing
            _idempotency_store[idempotency_key] = {
                "status": "processing",
                "response": None,
            }

    return idempotency_key


def save_idempotency_response(idempotency_key: str | None, response_data):
    if not idempotency_key:
        return

    with _lock:
        _idempotency_store[idempotency_key] = {
            "status": "completed",
            "response": response_data,
        }
