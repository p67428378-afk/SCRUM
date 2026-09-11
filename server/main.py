"""FastAPI application for the Sales ETL Pipeline Service."""
import json
import os
from typing import Optional
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from server.database import Base, engine, get_db
from server.etl_pipeline import run_etl_pipeline
from server.models import ETLMetricsResponse, ETLRunRequest, HealthResponse

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Sales Order ETL Service",
    description="ETL pipeline service to extract raw sales orders from PostgreSQL, filter invalid records, and load into BigQuery.",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS configuration per Constitution Section 5.4
allowed_origins_env = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000")
allowed_origins = [origin.strip() for origin in allowed_origins_env.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", response_model=HealthResponse, tags=["Health"])
@app.get("/api/v1/health", response_model=HealthResponse, tags=["Health"])
def health_check():
    """Health check endpoint to verify service operational status."""
    return HealthResponse(
        status="healthy",
        service="sales-order-etl-service",
        version="1.0.0"
    )


@app.post(
    "/api/v1/etl/run",
    response_model=ETLMetricsResponse,
    status_code=status.HTTP_200_OK,
    tags=["ETL Pipeline"],
    summary="Trigger ETL Pipeline Execution"
)
def trigger_etl_run(
    payload: Optional[ETLRunRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Triggers the ETL pipeline to extract sales orders from PostgreSQL,
    filter out invalid emails or missing amounts, and load valid orders into BigQuery.
    """
    try:
        batch_size = payload.batch_size if payload else None
        date_filter = payload.date_filter if payload else None
        metrics = run_etl_pipeline(db=db, batch_size=batch_size, date_filter=date_filter)
        if metrics.status.startswith("FAILED"):
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=metrics.status
            )
        return metrics
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Pipeline execution error: {str(e)}"
        )


def export_openapi_schema(output_path: str = "openapi.json"):
    """Exports OpenAPI JSON specification."""
    schema = app.openapi()
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(schema, f, indent=2)
    return schema


if __name__ == "__main__":
    import uvicorn
    export_openapi_schema()
    uvicorn.run("server.main:app", host="0.0.0.0", port=8000, reload=True)
