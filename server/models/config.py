import datetime

from sqlalchemy import Column, DateTime, String, Text

from server.database import Base


class ConfigItem(Base):
    __tablename__ = "config"

    key = Column(String(100), primary_key=True, unique=True, nullable=False)
    value = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    updated_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
    )
