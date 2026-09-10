import os
import logging
from contextlib import asynccontextmanager
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, status, Query
from starlette.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from server.database import get_db, init_db
from server.schemas import (
    TransferCreate,
    TransferResponse,
    AccountResponse,
    ErrorResponse,
)
from server.services import (
    process_transfer,
    get_transfers,
    get_transfer_by_id,
    get_account_balance,
)

logger = logging.getLogger("p2p_transfer_api")
logging.basicConfig(level=logging.INFO)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager to initialize database schema and seed data on startup."""
    init_db()
    logger.info("Database initialized and seeded.")
    yield


app = FastAPI(
    title="Secure Peer-to-Peer (P2P) Money Transfer API",
    version="1.0.0",
    description="Backend API for secure real-time P2P transfers with fraud detection and balance checks.",
    lifespan=lifespan,
)

# CORS Middleware configuration
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000"
).split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["General"])
def root():
    return {
        "message": "Secure Peer-to-Peer (P2P) Money Transfer API",
        "version": "1.0.0",
        "docs_url": "/docs",
    }


@app.get("/health", tags=["General"])
@app.get("/api/v1/health", tags=["General"])
def health_check():
    return {"status": "ok"}


@app.post(
    "/api/v1/transfers",
    response_model=TransferResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        400: {
            "model": ErrorResponse,
            "description": "Business rule error (Fraud exceeded or Insufficient funds)",
        },
        422: {"description": "Validation error"},
    },
    tags=["Transfers"],
)
def create_transfer(transfer_in: TransferCreate, db: Session = Depends(get_db)):
    """
    Execute a secure P2P money transfer.

    - **sender_id**: Account ID of the sender
    - **receiver_id**: Account ID of the recipient
    - **amount**: Positive numeric value in USD (max $10,000.00)
    """
    return process_transfer(
        db=db,
        sender_id=transfer_in.sender_id,
        receiver_id=transfer_in.receiver_id,
        amount=transfer_in.amount,
    )


@app.get("/api/v1/transfers", response_model=List[TransferResponse], tags=["Transfers"])
def list_transfers(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = Query(
        None, description="Optional filter by user ID (sender or receiver)"
    ),
    db: Session = Depends(get_db),
):
    """Retrieve transfer history with optional user filter and pagination."""
    return get_transfers(db=db, skip=skip, limit=limit, user_id=user_id)


@app.get(
    "/api/v1/transfers/{transfer_id}",
    response_model=TransferResponse,
    responses={404: {"model": ErrorResponse, "description": "Transfer not found"}},
    tags=["Transfers"],
)
def get_transfer(transfer_id: str, db: Session = Depends(get_db)):
    """Get single transfer details by transaction UUID."""
    transfer = get_transfer_by_id(db=db, transfer_id=transfer_id)
    if not transfer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Transfer not found"
        )
    return transfer


@app.get(
    "/api/v1/accounts/{account_id}/balance",
    response_model=AccountResponse,
    tags=["Accounts"],
)
@app.get(
    "/api/v1/balance/{account_id}", response_model=AccountResponse, tags=["Accounts"]
)
def get_balance(account_id: str, db: Session = Depends(get_db)):
    """Get current account information and balance for an account ID."""
    return get_account_balance(db=db, account_id=account_id)
