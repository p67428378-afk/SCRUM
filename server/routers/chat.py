from fastapi import APIRouter, WebSocket

router = APIRouter()

@router.websocket("/{rental_id}")
async def chat(websocket: WebSocket, rental_id: str):
    await websocket.accept()
    while True:
        data = await websocket.receive_text()
        await websocket.send_text(f"Message text was: {data}")
