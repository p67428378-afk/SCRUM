
import uuid
from pydantic import BaseModel, Field

class Todo(BaseModel):
    id: uuid.UUID = Field(default_factory=uuid.uuid4)
    description: str
    completed: bool = False
