import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from server.database import Base


# Helper to generate UUID as string or UUID object depending on DB
def generate_uuid():
    return str(uuid.uuid4())


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    prep_time = Column(Integer, nullable=False)
    cook_time = Column(Integer, nullable=False)
    servings = Column(Integer, nullable=False)
    instructions = Column(Text, nullable=False)
    created_at = Column(
        DateTime, default=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    ingredients = relationship(
        "Ingredient", back_populates="recipe", cascade="all, delete-orphan"
    )


class Ingredient(Base):
    __tablename__ = "ingredients"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    recipe_id = Column(
        String(36), ForeignKey("recipes.id", ondelete="CASCADE"), nullable=False
    )
    name = Column(String(255), nullable=False)
    quantity = Column(String(50), nullable=False)
    unit = Column(String(50), nullable=True)

    recipe = relationship("Recipe", back_populates="ingredients")
