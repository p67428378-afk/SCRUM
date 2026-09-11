# PostgreSQL to BigQuery Sales Orders ETL Pipeline (SCRUM-278)

## 1. Overview
This project provides a serverless batch ETL pipeline implemented in **Python 3.11** that extracts sales orders from the PostgreSQL `raw_sales_orders` table, validates and filters out corrupted records, and loads cleaned records into Google BigQuery's `fct_sales_orders` table partitioned by `order_date` (DAY granularity).

## 2. Architecture & Pipeline Stages
1. **Extraction**: Connects to PostgreSQL (`DATABASE_URL`) via SQLAlchemy and extracts raw records from `raw_sales_orders`.
2. **Validation & Filtering**:
   - **Amount Validation**: Rejects records with `NULL`, missing, or non-numeric `amount`.
   - **Email Validation**: Rejects records with `customer_email` failing RFC 5322 regex specification (`^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$`).
3. **Ingestion**: Streams / batch loads valid records into BigQuery `fct_sales_orders` with DAY partitioning on `order_date` and clustering on `customer_email`.
4. **Metrics & Audit**: Collects execution statistics including total extracted, loaded, and filtered counts by reason code.

## 3. Repository Structure
```
├── server/
│   ├── __init__.py
│   ├── database.py              # PostgreSQL database engine and session management
│   ├── models.py                # SQLAlchemy ORM and Pydantic schemas
│   ├── extractor.py             # PostgreSQL data extraction engine
│   ├── validator.py             # RFC 5322 email and amount validation rules
│   ├── loader.py                # BigQuery partitioned ingestion engine
│   ├── etl_pipeline.py          # Core ETL workflow and CLI runner
│   ├── main.py                  # FastAPI server with Auto-Boot startup hook
│   └── requirements.txt
├── dags/
│   ├── __init__.py
│   └── postgres_to_bigquery_sales_dag.py # Airflow / Cloud Composer DAG definition
├── schemas/
│   └── fct_sales_orders_schema.json     # BigQuery JSON schema definition
├── sql/
│   └── ddl/
│       └── fct_sales_orders.sql         # BigQuery partitioned DDL
├── tests/
│   ├── __init__.py
│   ├── test_validator.py        # Validation unit tests
│   ├── test_extractor.py        # Extraction unit tests
│   ├── test_loader.py           # Loader & BigQuery mock tests
│   └── test_etl_pipeline.py     # End-to-end integration and API tests
├── Dockerfile                   # Cloud Run container definition (Port 8080)
├── requirements.txt             # Python dependencies
├── .env.example                 # Sample environment configuration
└── README.md
```

## 4. Local Development & Setup

### Environment Setup
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

### Running Tests
Execute the comprehensive pytest validation suite:
```bash
pytest -v
```

### Running ETL Locally via CLI
```bash
python -m server.etl_pipeline --dry-run
```

### Running Serverless Container / API Server
```bash
uvicorn server.main:app --host 0.0.0.0 --port 8080
```
- Health Check: `GET http://localhost:8080/health`
- Trigger ETL Run: `POST http://localhost:8080/api/v1/etl/run`
- Check Status: `GET http://localhost:8080/api/v1/etl/status`
