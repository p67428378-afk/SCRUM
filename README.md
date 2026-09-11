# SCRUM-278: PostgreSQL to BigQuery Sales ETL Pipeline

Automated batch ETL pipeline to extract raw sales order records from PostgreSQL (`raw_sales_orders`), filter out invalid records (missing/non-numeric amount or non-RFC 5322 emails), and load cleaned records into BigQuery fact table (`fct_sales_orders`) partitioned daily by `order_date`.

---

## 1. Architecture & Features
- **Extraction:** Reads from PostgreSQL `raw_sales_orders` table via SQLAlchemy.
- **Validation / Transformation:**
  - **Amount Filter:** Rejects records where `amount` is NULL, missing, or non-numeric.
  - **Email Filter:** Rejects records where `customer_email` fails RFC 5322 regex validation (`^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$`).
- **Loading:** Loads clean records into Google BigQuery `analytics.fct_sales_orders` with DAY partitioning on `order_date`.
- **API & Trigger:** FastAPI endpoint `POST /api/v1/etl/run` and CLI entrypoint `python -m server.etl_pipeline`.
- **OpenAPI:** Complete OpenAPI specification exported at `openapi.json`.

---

## 2. Directory Structure
```
├── openapi.json                  # OpenAPI 3.1 specification for API endpoints
├── server/
│   ├── __init__.py
│   ├── database.py               # Database connection and session management
│   ├── models.py                 # SQLAlchemy and Pydantic models
│   ├── extractor.py              # PostgreSQL extraction module
│   ├── validator.py              # Filtering rules and data validator
│   ├── loader.py                 # BigQuery ingestion module
│   ├── etl_pipeline.py           # Pipeline runner & orchestrator
│   ├── main.py                   # FastAPI service & trigger endpoints
│   └── requirements.txt
├── schemas/
│   └── fct_sales_orders_schema.json
├── sql/
│   └── ddl/
│       └── fct_sales_orders.sql  # BigQuery DDL table definition
├── tests/
│   ├── __init__.py
│   ├── test_validator.py         # Validation rules unit tests
│   ├── test_extractor.py         # Extractor unit tests
│   ├── test_loader.py            # BigQuery loader unit tests
│   └── test_etl_pipeline.py      # End-to-end integration & API tests
├── .env.example
├── requirements.txt
└── README.md
```

---

## 3. Local Development & Setup

### Prerequisites
- Python 3.11+
- PostgreSQL or SQLite

### Installation
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Configuration
Copy `.env.example` to `.env` and set your credentials:
```bash
cp .env.example .env
```

### Running the API Server
```bash
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

### Triggering ETL via API
```bash
curl -X POST http://localhost:8000/api/v1/etl/run
```

### Triggering ETL via CLI
```bash
python -m server.etl_pipeline
```

---

## 4. Running Tests
```bash
pytest tests/ -v
```
