from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator


class IngredientBase(BaseModel):
    name: str = Field(..., min_length=1, description="Name of the ingredient")
    quantity: str = Field(..., min_length=1, description="Quantity of the ingredient")
    unit: Optional[str] = Field(None, description="Unit of measurement")


class IngredientCreate(IngredientBase):
    pass


class Ingredient(IngredientBase):
    id: str
    recipe_id: str

    class Config:
        from_attributes = True


class RecipeBase(BaseModel):
    title: str = Field(..., min_length=1, description="Title of the recipe")
    description: str = Field(
        ..., min_length=1, description="Brief description of the recipe"
    )
    prep_time: int = Field(..., description="Preparation time in minutes")
    cook_time: int = Field(..., description="Cooking time in minutes")
    servings: int = Field(..., description="Number of servings")
    instructions: str = Field(
        ..., min_length=1, description="Step-by-step cooking instructions"
    )

    @field_validator("prep_time", "cook_time", "servings")
    @classmethod
    def validate_positive(cls, v: int, info) -> int:
        if v <= 0:
            raise ValueError("Please enter a valid positive number.")
        return v


class RecipeCreate(RecipeBase):
    ingredients: List[IngredientCreate] = Field(
        ..., min_length=1, description="List of ingredients"
    )


class Recipe(RecipeBase):
    id: str
    created_at: datetime
    updated_at: datetime
    ingredients: List[Ingredient]

    class Config:
        from_attributes = True
