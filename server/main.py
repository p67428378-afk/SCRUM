
from fastapi import FastAPI
from server.api.v1.endpoints import auth, cars, bookings, payments, chat
from server.database import engine
from server.models import base, user, location, car, rental, message

base.Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(cars.router, prefix="/api/v1/cars", tags=["cars"])
app.include_router(bookings.router, prefix="/api/v1/bookings", tags=["bookings"])
app.include_router(payments.router, prefix="/api/v1/payments", tags=["payments"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])

@app.get("/")
def read_root():
    return {"Hello": "World"}
