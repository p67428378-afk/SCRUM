from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional, List

from server.database import get_db
from server.models.restaurant import Restaurant, MenuItem
from server.schemas.restaurant import (
    RestaurantCreate,
    RestaurantResponse,
    MenuItemCreate,
    MenuItemResponse,
)
from server.routers.auth import get_current_user, check_role

router = APIRouter(prefix="/api/v1/restaurants", tags=["restaurants"])


@router.post("", response_model=RestaurantResponse, status_code=status.HTTP_201_CREATED)
def create_restaurant(
    restaurant_in: RestaurantCreate,
    db: Session = Depends(get_db),
    current_user=Depends(check_role(["Administrator", "Manager"])),
):
    restaurant = Restaurant(
        name=restaurant_in.name,
        cuisine=restaurant_in.cuisine,
        address=restaurant_in.address,
        phone_number=restaurant_in.phone_number,
        operating_hours=restaurant_in.operating_hours,
    )
    db.add(restaurant)
    db.commit()
    db.refresh(restaurant)
    return restaurant


@router.get("", response_model=List[RestaurantResponse])
def get_restaurants(
    cuisine: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    query = db.query(Restaurant)
    if cuisine:
        query = query.filter(Restaurant.cuisine.ilike(f"%{cuisine}%"))
    return query.offset(skip).limit(limit).all()


@router.get("/{restaurant_id}", response_model=RestaurantResponse)
def get_restaurant(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found"
        )
    return restaurant


@router.post(
    "/{restaurant_id}/menu-items",
    response_model=MenuItemResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_menu_item(
    restaurant_id: str,
    menu_item_in: MenuItemCreate,
    db: Session = Depends(get_db),
    current_user=Depends(check_role(["Administrator", "Manager"])),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found"
        )

    menu_item = MenuItem(
        restaurant_id=restaurant_id,
        name=menu_item_in.name,
        description=menu_item_in.description,
        price=menu_item_in.price,
        category=menu_item_in.category,
    )
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    return menu_item


@router.get("/{restaurant_id}/menu-items", response_model=List[MenuItemResponse])
def get_menu_items(
    restaurant_id: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    restaurant = db.query(Restaurant).filter(Restaurant.id == restaurant_id).first()
    if not restaurant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Restaurant not found"
        )
    return db.query(MenuItem).filter(MenuItem.restaurant_id == restaurant_id).all()
