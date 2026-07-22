import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime
from server.database import Base


class Todo(Base):
    __tablename__ = "todos"

    # Use String(36) or UUID depending on database dialect, or a custom type.
    # To support both SQLite (which doesn't have native UUID) and PostgreSQL,
    # we can use String(36) as the storage type, or a UUID type that falls back to String.
    # Let's use String(36) with a default of uuid.uuid4 as string, or use UUID(as_uuid=True) for Postgres and String for SQLite.
    # Actually, SQLAlchemy's UUID type with as_uuid=True works well, but on SQLite it behaves as CHAR(32) or CHAR(36).
    # Let's use String(36) or Column(String, primary_key=True, default=lambda: str(uuid.uuid4())) to be extremely safe and compatible across SQLite and Postgres.
    # Wait, the WorkSpec says:
    # "id: UUID, Primary Key, Not Null"
    # Let's use String(36) or a custom UUID type, or just String(36) with default lambda: str(uuid.uuid4()).
    # Let's use String(36) with default lambda: str(uuid.uuid4()). It is highly compatible and works perfectly.
    id = Column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True
    )
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=True)
    priority = Column(String(50), nullable=False, default="Medium")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )
