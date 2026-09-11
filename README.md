# Daily Batch ETL Pipeline for Retail Orders Ingestion & Normalization

**Jira Ticket**: `SCRUM-275`  
**GCP Project**: `upbeat-repeater-477110-q6`  
**Target BigQuery Table**: `analytics.retail_orders` (Partitioned by `DAY(order_date)`, Clustered by `customer_id, original_currency`)  
**Audit Table**: `analytics.etl_audit_logs` (Partitioned by `DAY(execution_date)`)  
**Source Bucket**: `gs://sdlc-etl-retail-orders-477110/daily/`  
**Quarantine Bucket**: `gs://sdlc-etl-retail-orders-477110/quarantine/`  

---

## 1. Overview

This production-grade ETL pipeline automates the daily ingestion of retail order CSV records from Google Cloud Storage, performs schema validation, cleans malformed rows to a quarantine repository, deduplicates records by `order_id` (keeping the latest record by `order_timestamp`), normalizes foreign transaction amounts into USD using daily exchange rates, and idempotently upserts records into Google BigQuery using staging tables and atomic `MERGE` statements.

---

## 2. Architecture & Data Flow

```
[ GCS: gs://sdlc-etl-retail-orders-477110/daily/*.csv ]
                        │
                        ▼
            [ RetailOrderCleaner ]
           ┌────────────┴────────────┐
           ▼                         ▼
  [ Schema / Format Valid ]   [ Malformed / Negative / Unparseable ]
           │                         │
           ▼                         ▼
  [ Deduplication (order_id) ]   [ Quarantine Handler ]
           │                         │
           ▼                         ▼
 [ Currency Normalizer (-> USD) ] [ GCS: quarantine/YYYY-MM-DD/ ]
           │
           ▼
[ BigQuery MERGE: analytics.retail_orders ]
           │
           ▼
[ Audit Logger: analytics.etl_audit_logs ]
```

---

## 3. Key Components

1. **`pipeline/currency.py`**:
   - Currency exchange normalization service with base rates for major international currencies (EUR, GBP, JPY, CAD, AUD, CHF, CNY, INR, etc.) and date-specific lookup capabilities.
2. **`pipeline/cleaner.py`**:
   - Schema validation, data type coercions, corrupt record filtering, and deduplication logic prioritizing latest order timestamps.
3. **`pipeline/loader.py`**:
   - BigQuery idempotent table loader (`MERGE` operation), table schema provisioner, quarantine storage writer, and audit logging engine.
4. **`pipeline/run_retail_orders_etl.py`**:
   - Standalone CLI and programmatic runner orchestrating the end-to-end pipeline.
5. **`app.py`**:
   - Serverless Cloud Run HTTP container service (port 8080) featuring an **Auto-Boot execution hook** that automatically runs the ETL task on container startup in a background thread.
6. **`dags/retail_orders_etl_dag.py`**:
   - Optional Cloud Composer / Airflow DAG running on a daily schedule (`0 5 * * *`).

---

## 4. BigQuery Schema

### `analytics.retail_orders`
| Field Name | Type | Mode | Description |
|---|---|---|---|
| `order_id` | STRING | REQUIRED | Primary Business Key |
| `customer_id` | STRING | REQUIRED | Unique Identifier for Customer |
| `order_date` | DATE | REQUIRED | Order Transaction Date (**Partition Key**) |
| `order_timestamp` | TIMESTAMP | REQUIRED | Exact Timestamp of Order Creation |
| `original_amount` | NUMERIC | REQUIRED | Order Amount in Original Currency |
| `original_currency` | STRING | REQUIRED | ISO Currency Code (e.g. USD, EUR, GBP) |
| `exchange_rate_used` | NUMERIC | REQUIRED | Conversion Rate applied to USD |
| `amount_usd` | NUMERIC | REQUIRED | Normalized Order Amount in USD |
| `item_count` | INTEGER | NULLABLE | Total items in the order |
| `status` | STRING | NULLABLE | Order status (e.g. COMPLETED, SHIPPED) |
| `ingested_at` | TIMESTAMP | REQUIRED | UTC Timestamp of pipeline execution |
| `source_filename` | STRING | REQUIRED | Source GCS CSV file name |

---

## 5. Local Setup & Testing

### Installation
```bash
python -m venv .venv
source .venv/bin/activate  # Or .venv\Scripts\activate on Windows
pip install -r requirements.txt
```

### Running Tests
```bash
pytest tests/ -v
```

### Running Pipeline Standalone
```bash
python -m pipeline.run_retail_orders_etl --bucket sdlc-etl-retail-orders-477110 --prefix daily/
```

### Running Cloud Run Webhook Server
```bash
python app.py
```

---

## 6. API Endpoints

- `GET /health` or `GET /api/v1/health`: Liveness probe.
- `GET /status` or `GET /api/v1/status`: Returns current pipeline execution status and latest run metrics.
- `POST /api/v1/trigger` or `POST /api/v1/etl/run`: Trigger on-demand ETL execution (supports `{ "execution_date": "YYYY-MM-DD", "force_sync": false }`).
