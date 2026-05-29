
from fastapi import FastAPI
from server.database import engine, Base
from server.routers import auth, cars, bookings, payments, chat

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cars.router, prefix="/api/v1/cars", tags=["cars"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["bookings"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"message": "Welcome to the Car Rental API"}

