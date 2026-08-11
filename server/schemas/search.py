from typing import List, Optional
from pydantic import BaseModel, Field


class CategoryResponse(BaseModel):
    id: str
    name: str
    slug: str

    class Config:
        from_attributes = True


class CategoryCount(BaseModel):
    id: str
    name: str
    count: int

    class Config:
        from_attributes = True


class ProductSuggestion(BaseModel):
    id: str
    title: str
    category_id: Optional[str] = None
    category_name: Optional[str] = None
    price: float
    thumbnail_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)

    class Config:
        from_attributes = True


class SearchResponse(BaseModel):
    query: str
    total: int
    page: int
    limit: int
    took_ms: int
    categories: List[CategoryCount] = Field(default_factory=list)
    suggestions: List[ProductSuggestion] = Field(default_factory=list)


class CategoryCreate(BaseModel):
    name: str
    slug: Optional[str] = None


class ProductCreate(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    thumbnail_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category_id: Optional[str] = None


class ProductResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    price: float
    thumbnail_url: Optional[str] = None
    tags: List[str] = Field(default_factory=list)
    category_id: Optional[str] = None
    category_name: Optional[str] = None

    class Config:
        from_attributes = True
