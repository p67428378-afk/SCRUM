
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from uuid import UUID

router = APIRouter()

@router.websocket("/{rental_id}")
async def chat(websocket: WebSocket, rental_id: UUID):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}")
    except WebSocketDisconnect:
        pass
