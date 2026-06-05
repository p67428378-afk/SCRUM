import uuid
from dataclasses import dataclass, field

@dataclass
class Todo:
    id: uuid.UUID = field(default_factory=uuid.uuid4)
    description: str = ""
    completed: bool = False
