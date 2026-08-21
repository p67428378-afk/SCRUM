from sqlalchemy.orm import Session
from server import models, schemas


def get_recipe(db: Session, recipe_id: str):
    return db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()


def get_recipes(db: Session, skip: int = 0, limit: int = 20, search: str = None):
    query = db.query(models.Recipe)
    if search:
        search_filter = f"%{search}%"
        # Join with Ingredient to search in ingredients as well
        query = (
            query.join(models.Recipe.ingredients, isouter=True)
            .filter(
                (models.Recipe.title.ilike(search_filter))
                | (models.Recipe.description.ilike(search_filter))
                | (models.Ingredient.name.ilike(search_filter))
            )
            .distinct()
        )
    return query.offset(skip).limit(limit).all()


def create_recipe(db: Session, recipe: schemas.RecipeCreate):
    db_recipe = models.Recipe(
        title=recipe.title,
        description=recipe.description,
        prep_time=recipe.prep_time,
        cook_time=recipe.cook_time,
        servings=recipe.servings,
        instructions=recipe.instructions,
    )
    db.add(db_recipe)
    db.flush()  # Generate ID for recipe

    for ing in recipe.ingredients:
        db_ingredient = models.Ingredient(
            recipe_id=db_recipe.id, name=ing.name, quantity=ing.quantity, unit=ing.unit
        )
        db.add(db_ingredient)

    db.commit()
    db.refresh(db_recipe)
    return db_recipe


def delete_recipe(db: Session, recipe_id: str):
    db_recipe = db.query(models.Recipe).filter(models.Recipe.id == recipe_id).first()
    if db_recipe:
        db.delete(db_recipe)
        db.commit()
        return True
    return False
