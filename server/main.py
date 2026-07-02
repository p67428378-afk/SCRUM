from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from .database import engine, Base, get_db
from . import schemas, crud

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DG Cluster Assortment Advisor API",
    description="Decision-support tool for Dollar General category managers",
    version="1.0.0",
)

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/dashboard", response_model=schemas.DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    try:
        return crud.get_dashboard_data(db)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database connection failure: {str(e)}",
        )


@app.post(
    "/api/v1/scenarios/{scenario_name}/apply", response_model=schemas.ScenarioResponse
)
def apply_scenario(scenario_name: str, db: Session = Depends(get_db)):
    result = crud.get_scenario_data(db, scenario_name)
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid scenario name provided: {scenario_name}",
        )
    return result


@app.post("/api/v1/assortments/submit", response_model=schemas.SubmitResponse)
def submit_assortment(payload: schemas.SubmitRequest, db: Session = Depends(get_db)):
    result = crud.create_submission(db, payload.dict())
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Guardrail violations prevent submission",
        )
    return result
