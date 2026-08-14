from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from server.app.api.endpoints import router as api_router
from server.app.config import settings
from server.app.database import engine, Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=settings.PROJECT_NAME)

# Set all CORS enabled origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/")
def root():
    return {"message": "Welcome to the Debit Card Spend Alert Microservice API"}


@app.on_event("startup")
def seed_data():
    from server.app.database import SessionLocal
    from server.app.models import Permission, Role

    db = SessionLocal()
    try:
        # Seed permissions
        perms_data = [
            ("View Dashboard", "Can view the security dashboard"),
            ("Manage Users", "Can provision, update, and deactivate users"),
            ("Manage Roles", "Can create roles and assign permissions"),
            ("View Audit Logs", "Can view system audit logs"),
        ]
        perms_map = {}
        for name, desc in perms_data:
            perm = db.query(Permission).filter(Permission.name == name).first()
            if not perm:
                perm = Permission(name=name, description=desc)
                db.add(perm)
                db.commit()
                db.refresh(perm)
            perms_map[name] = perm

        # Seed roles
        roles_data = [
            (
                "System Administrator",
                "Full system access",
                ["View Dashboard", "Manage Users", "Manage Roles", "View Audit Logs"],
            ),
            (
                "Branch Manager",
                "Branch management access",
                ["View Dashboard", "View Audit Logs"],
            ),
            ("Teller", "Basic teller access", ["View Dashboard"]),
        ]
        for name, desc, perm_names in roles_data:
            role = db.query(Role).filter(Role.name == name).first()
            if not role:
                role = Role(name=name, description=desc)
                role.permissions = [perms_map[p_name] for p_name in perm_names]
                db.add(role)
                db.commit()
    except Exception as e:
        print(f"Error seeding data: {e}")
    finally:
        db.close()
