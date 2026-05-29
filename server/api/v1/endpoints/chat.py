
from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()

@router.websocket("/{rental_id}")
async def websocket_endpoint(websocket: WebSocket, rental_id: str):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            await websocket.send_text(f"Message text was: {data}, for rental {rental_id}")
    except WebSocketDisconnect:
        # Handle disconnection
        pass
