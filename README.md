# Sales Order ETL Pipeline (SCRUM-278)

An enterprise-grade ETL pipeline service that extracts sales order data from PostgreSQL `raw_sales_orders`, validates records against data quality constraints (RFC 5322 email syntax and amount integrity), and loads cleaned records into Google BigQuery `fct_sales_orders` partitioned by order date.

---

## 1. Overview & Architecture

- **Source**: PostgreSQL table `raw_sales_orders` (`order_id`, `customer_email`, `amount`, `order_date`, `created_at`).
- **Validation Engine**:
  - Rejects records where `amount` is NULL, missing, or non-numeric.
  - Rejects records where `customer_email` does not conform to RFC 5322 standard.
- **Destination**: Google BigQuery table `fct_sales_orders` partitioned by `DAY` on `order_date`.
- **API Entrypoint**: FastAPI service running on port `8000`.

---

## 2. API Endpoints

- `GET /health` or `GET /api/v1/health` - Health check status.
- `POST /api/v1/etl/run` - Trigger ETL pipeline execution and retrieve execution audit metrics.
- `GET /docs` - Interactive OpenAPI Swagger UI documentation.
- `GET /openapi.json` - OpenAPI JSON specification.

---

## 3. Local Development Setup

### Install Dependencies
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### Run Tests
```bash
pytest tests/ -v
```

### Start API Server
```bash
python -m server.main
# Or run with uvicorn:
uvicorn server.main:app --host 0.0.0.0 --port 8000 --reload
```

---

## 4. BigQuery Partitioning & DDL

The target table is partitioned by `order_date` (`DAY` granularity). Schema definition is available in `schemas/fct_sales_orders_schema.json` and SQL DDL in `sql/ddl/fct_sales_orders.sql`.
