
from pydantic import BaseModel, EmailStr
import uuid

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class Renter(BaseModel):
    renter_id: uuid.UUID
    username: str
    email: EmailStr

    class Config:
        orm_mode = True

class CarOwner(BaseModel):
    owner_id: uuid.UUID
    username: str
    email: EmailStr

    class Config:
        orm_mode = True
