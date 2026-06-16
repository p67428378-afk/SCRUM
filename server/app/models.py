"""
Module: models
Purpose: SQLAlchemy database models for KYC onboarding.
Author: Backend Developer Agent
Created: 2026-06-16
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, ForeignKey, JSON, Text, DateTime
from sqlalchemy.orm import relationship
from server.app.database import Base


def get_utc_now():
    return datetime.now(timezone.utc)


class Customer(Base):
    __tablename__ = "Customer"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    aadhaar_number = Column(String(50), nullable=False)
    pan_number = Column(String(50), nullable=False)
    created_at = Column(DateTime, nullable=False, default=get_utc_now)
    updated_at = Column(DateTime, nullable=False, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    kyc_requests = relationship("KYCRequest", back_populates="customer", cascade="all, delete-orphan")


class KYCRequest(Base):
    __tablename__ = "KYCRequest"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("Customer.id"), nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    created_at = Column(DateTime, nullable=False, default=get_utc_now)
    updated_at = Column(DateTime, nullable=False, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    customer = relationship("Customer", back_populates="kyc_requests")
    verification = relationship("Verification", back_populates="kyc_request", uselist=False, cascade="all, delete-orphan")
    screening = relationship("Screening", back_populates="kyc_request", uselist=False, cascade="all, delete-orphan")
    audit_logs = relationship("AuditLog", back_populates="kyc_request", cascade="all, delete-orphan")


class Verification(Base):
    __tablename__ = "Verification"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kyc_request_id = Column(String(36), ForeignKey("KYCRequest.id"), nullable=False)
    aadhaar_status = Column(String(50), nullable=False, default="PENDING")
    aadhaar_response = Column(JSON, nullable=True)
    pan_status = Column(String(50), nullable=False, default="PENDING")
    pan_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=get_utc_now)
    updated_at = Column(DateTime, nullable=False, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    kyc_request = relationship("KYCRequest", back_populates="verification")


class Screening(Base):
    __tablename__ = "Screening"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kyc_request_id = Column(String(36), ForeignKey("KYCRequest.id"), nullable=False)
    rbi_status = Column(String(50), nullable=False, default="PENDING")
    rbi_response = Column(JSON, nullable=True)
    cibil_status = Column(String(50), nullable=False, default="PENDING")
    cibil_response = Column(JSON, nullable=True)
    created_at = Column(DateTime, nullable=False, default=get_utc_now)
    updated_at = Column(DateTime, nullable=False, default=get_utc_now, onupdate=get_utc_now)

    # Relationships
    kyc_request = relationship("KYCRequest", back_populates="screening")


class AuditLog(Base):
    __tablename__ = "AuditLog"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    kyc_request_id = Column(String(36), ForeignKey("KYCRequest.id"), nullable=False)
    action = Column(String(255), nullable=False)
    details = Column(Text, nullable=False)
    timestamp = Column(DateTime, nullable=False, default=get_utc_now)

    # Relationships
    kyc_request = relationship("KYCRequest", back_populates="audit_logs")
