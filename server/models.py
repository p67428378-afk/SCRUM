import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship

from server.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class Continent(Base):
    __tablename__ = "continents"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True, index=True)
    code = Column(String(10), nullable=False, unique=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    countries = relationship(
        "Country", back_populates="continent", cascade="all, delete-orphan"
    )


class Country(Base):
    __tablename__ = "countries"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    continent_id = Column(String(36), ForeignKey("continents.id"), nullable=False)
    name = Column(String(100), nullable=False, index=True)
    code = Column(String(10), nullable=False, index=True)
    capital = Column(String(100), nullable=True)
    population = Column(Integer, nullable=True)
    region = Column(String(100), nullable=True)
    portfolio_status = Column(String(50), nullable=False, default="Active")
    total_investment_usd = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    continent = relationship("Continent", back_populates="countries")
    investments = relationship(
        "PortfolioInvestment", back_populates="country", cascade="all, delete-orphan"
    )


class PortfolioInvestment(Base):
    __tablename__ = "portfolio_investments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    country_id = Column(String(36), ForeignKey("countries.id"), nullable=False)
    asset_name = Column(String(200), nullable=False)
    sector = Column(String(100), nullable=False)
    amount_usd = Column(Float, nullable=False, default=0.0)
    status = Column(String(50), nullable=False, default="Performing")
    date_added = Column(String(20), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    country = relationship("Country", back_populates="investments")
