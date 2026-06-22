"""
Module: schemas.resident
Purpose: Pydantic schemas for Resident and FamilyMember
"""

from typing import List, Optional
from pydantic import BaseModel, EmailStr


class FamilyMemberBase(BaseModel):
    name: str
    relationship: str
    phone_number: Optional[str] = None


class FamilyMemberCreate(FamilyMemberBase):
    pass


class FamilyMemberResponse(FamilyMemberBase):
    id: str

    class Config:
        from_attributes = True


class ResidentBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: str


class ResidentUpdate(ResidentBase):
    family_members: List[FamilyMemberCreate] = []


class ResidentResponse(ResidentBase):
    id: str
    apartment_number: str
    family_members: List[FamilyMemberResponse] = []

    class Config:
        from_attributes = True
