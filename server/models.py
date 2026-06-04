
import uuid
from sqlalchemy import (Column, String, Text, DateTime, func, TypeDecorator, CHAR)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
import uuid

class GUID(TypeDecorator):
    """Platform-independent GUID type.

    Uses PostgreSQL's UUID type, otherwise uses
    CHAR(32), storing as stringified hex values.

    """
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(UUID())
        else:
            return dialect.type_descriptor(CHAR(32))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return "%.32x" % uuid.UUID(value).int
            else:
                # hexstring
                return "%.32x" % value.int

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                value = uuid.UUID(value)
            return value

Base = declarative_base()

class Announcement(Base):
    __tablename__ = 'announcements'
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    summary = Column(String, nullable=True)
    content = Column(Text, nullable=False)
    publication_date = Column(DateTime, nullable=False)
    author = Column(String, nullable=False)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

class Event(Base):
    __tablename__ = 'events'
    id = Column(GUID, primary_key=True, default=uuid.uuid4)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(DateTime, nullable=False)
    location = Column(String, nullable=False)
    category = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
