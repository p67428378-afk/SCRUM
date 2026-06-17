import sqlalchemy
from sqlalchemy.pool import StaticPool

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

from server.app import models
