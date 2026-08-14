import sys
import types
import sqlalchemy
from sqlalchemy.pool import StaticPool

# 1. Patch create_engine FIRST before any other imports
original_create_engine = sqlalchemy.create_engine


def patched_create_engine(*args, **kwargs):
    if args and args[0] == "sqlite:///:memory:":
        # Use a shared in-memory database so all engines share the same database
        args = ("sqlite:///file:memdb_scrum67?mode=memory&cache=shared",) + args[1:]
        kwargs["poolclass"] = StaticPool
        if "connect_args" not in kwargs:
            kwargs["connect_args"] = {}
        kwargs["connect_args"]["uri"] = True
    return original_create_engine(*args, **kwargs)


sqlalchemy.create_engine = patched_create_engine

# 2. Now import and inject server.database and server.main dynamically
from server.app.database import Base, get_db

db_module = types.ModuleType("server.database")
db_module.Base = Base
db_module.get_db = get_db
sys.modules["server.database"] = db_module

from server.app.main import app

main_module = types.ModuleType("server.main")
main_module.app = app
sys.modules["server.main"] = main_module

from server.app import models
