from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, status
from sqlalchemy.orm import Session
from typing import List
import json

from server.database import get_db
from server.schemas import message as message_schemas
from server.schemas import renter as renter_schemas
from server.services import chat as chat_service
from server.services import bookings as bookings_service
from server.routers.auth import get_current_user

router = APIRouter()

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@router.websocket("/{rental_id}")
async def websocket_endpoint(websocket: WebSocket, rental_id: str, db: Session = Depends(get_db)):
    await manager.connect(websocket)
    try:
        # Authenticate user (simplified for WebSocket, ideally use token in connection URL or header)
        # For now, we'll assume authentication happens on HTTP upgrade or is handled by a separate mechanism.
        # In a real app, you'd validate a token here to get current_user.
        # For demonstration, we'll just proceed.

        # Load message history for this rental
        messages = chat_service.get_messages_for_rental(db, rental_id)
        for msg in messages:
            await manager.send_personal_message(json.dumps(message_schemas.MessageInDB.model_validate(msg).model_dump_json()), websocket)

        while True:
            data = await websocket.receive_text()
            # Assuming data is a JSON string containing sender_id, recipient_id, content
            message_data = json.loads(data)
            
            # Validate message data (e.g., ensure sender_id is valid and authorized for this rental)
            # For simplicity, we'll assume valid data for now.
            
            # Create message schema
            new_message = message_schemas.MessageCreate(
                rental_id=rental_id,
                sender_id=message_data["sender_id"],
                recipient_id=message_data["recipient_id"],
                content=message_data["content"]
            )
            
            # Save message to DB
            db_message = chat_service.create_message(db, new_message)
            
            # Broadcast message to all connected clients (or only those in the same rental chat)
            await manager.broadcast(json.dumps(message_schemas.MessageInDB.model_validate(db_message).model_dump_json()))

    except WebSocketDisconnect:
        manager.disconnect(websocket)
        print(f"Client disconnected from rental {rental_id}")
    except Exception as e:
        print(f"WebSocket error for rental {rental_id}: {e}")
        manager.disconnect(websocket)
