"""Transformation logic and quality assertions for customer_transactions_etl pipeline.
Supports both pandas DataFrames and pure Python dictionaries/lists for environment portability.
"""
from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Tuple, Union

try:
    import pandas as pd
except ImportError:
    pd = None

logger = logging.getLogger(__name__)


def transform_and_cleanse_transactions(
    data: Union[List[Dict[str, Any]], Any]
) -> Union[List[Dict[str, Any]], Any]:
    """Transforms raw transaction records:
    1. Cleanse nulls and string strip on customer_id and transaction_id.
    2. Normalize currency to USD base (usd_amount = original_amount * exchange_rate).
    3. Deduplicate on transaction_id retaining the latest transaction_timestamp.
    4. Cast data types and populate cleansed_at timestamp.
    """
    if data is None:
        return []

    # Handle pandas DataFrame if available
    if pd is not None and isinstance(data, pd.DataFrame):
        if data.empty:
            return data

        transformed = data.copy()
        if "transaction_id" in transformed.columns:
            transformed["transaction_id"] = transformed["transaction_id"].astype(str).str.strip()
        if "customer_id" in transformed.columns:
            transformed["customer_id"] = transformed["customer_id"].astype(str).str.strip()

        transformed = transformed[
            (transformed["transaction_id"].notna())
            & (transformed["transaction_id"] != "")
            & (transformed["transaction_id"] != "nan")
            & (transformed["transaction_id"] != "None")
            & (transformed["customer_id"].notna())
            & (transformed["customer_id"] != "")
            & (transformed["customer_id"] != "nan")
            & (transformed["customer_id"] != "None")
        ]

        if "transaction_timestamp" in transformed.columns:
            transformed["transaction_timestamp"] = pd.to_datetime(transformed["transaction_timestamp"], utc=True)
            transformed = transformed.sort_values("transaction_timestamp", ascending=True)
            transformed = transformed.drop_duplicates(subset=["transaction_id"], keep="last")

        if "transaction_date" in transformed.columns:
            transformed["transaction_date"] = pd.to_datetime(transformed["transaction_date"]).dt.date
        elif "transaction_timestamp" in transformed.columns:
            transformed["transaction_date"] = transformed["transaction_timestamp"].dt.date

        transformed["original_amount"] = pd.to_numeric(transformed["original_amount"], errors="coerce").fillna(0.0)
        transformed["exchange_rate"] = pd.to_numeric(transformed["exchange_rate"], errors="coerce").fillna(1.0)
        transformed["usd_amount"] = (transformed["original_amount"] * transformed["exchange_rate"]).round(4)

        if "currency" in transformed.columns:
            transformed["currency"] = transformed["currency"].astype(str).str.strip().str.upper()

        transformed["cleansed_at"] = pd.Timestamp.now(tz=timezone.utc)
        return transformed

    # Pure Python list-of-dicts implementation
    records = data if isinstance(data, list) else list(data)
    cleansed_records = []
    
    for row in records:
        if not isinstance(row, dict):
            continue
        raw_tx_id = row.get("transaction_id")
        raw_cust_id = row.get("customer_id")
        if raw_tx_id is None or raw_cust_id is None:
            continue
        tx_id = str(raw_tx_id).strip()
        cust_id = str(raw_cust_id).strip()
        if not tx_id or tx_id.lower() in ("nan", "none") or not cust_id or cust_id.lower() in ("nan", "none"):
            continue

        try:
            orig_amount = float(row.get("original_amount", 0.0))
        except (ValueError, TypeError):
            orig_amount = 0.0

        try:
            rate = float(row.get("exchange_rate", 1.0))
        except (ValueError, TypeError):
            rate = 1.0

        usd_amt = round(orig_amount * rate, 4)
        currency_code = str(row.get("currency", "USD")).strip().upper()
        tx_ts = row.get("transaction_timestamp", "")
        tx_date = row.get("transaction_date") or (str(tx_ts)[:10] if tx_ts else str(datetime.now(timezone.utc).date()))

        cleansed_row = {
            "transaction_id": tx_id,
            "customer_id": cust_id,
            "transaction_date": tx_date,
            "transaction_timestamp": tx_ts,
            "original_amount": orig_amount,
            "currency": currency_code,
            "exchange_rate": rate,
            "usd_amount": usd_amt,
            "cleansed_at": datetime.now(timezone.utc).isoformat(),
        }
        cleansed_records.append(cleansed_row)

    # Deduplication on transaction_id (retaining latest timestamp)
    def parse_ts(val: Any) -> str:
        return str(val.get("transaction_timestamp", ""))

    cleansed_records.sort(key=parse_ts)
    deduped_map: Dict[str, Dict[str, Any]] = {}
    for r in cleansed_records:
        deduped_map[r["transaction_id"]] = r

    return list(deduped_map.values())


def validate_transaction_quality(
    data: Union[List[Dict[str, Any]], Any]
) -> Tuple[bool, Dict[str, Any]]:
    """Validates data quality rules:
    1. Non-null check on primary keys (transaction_id, customer_id).
    2. Duplicate check assertion on primary keys (transaction_id).
    3. Row count threshold (> 0 records).
    """
    validation_results = {
        "row_count_check": False,
        "null_check_transaction_id": False,
        "null_check_customer_id": False,
        "uniqueness_check_transaction_id": False,
        "total_rows": 0,
        "errors": [],
    }

    if data is None:
        validation_results["errors"].append("Data is None. Validation failed.")
        return False, validation_results

    # Pandas DataFrame validation
    if pd is not None and isinstance(data, pd.DataFrame):
        row_count = len(data)
        validation_results["total_rows"] = row_count
        validation_results["row_count_check"] = row_count > 0
        if row_count == 0:
            validation_results["errors"].append("Row count is 0. Threshold check failed.")
            return False, validation_results

        null_tx = data["transaction_id"].isna().sum() + (data["transaction_id"] == "").sum()
        null_cust = data["customer_id"].isna().sum() + (data["customer_id"] == "").sum()
        validation_results["null_check_transaction_id"] = (null_tx == 0)
        validation_results["null_check_customer_id"] = (null_cust == 0)

        dup_count = data.duplicated(subset=["transaction_id"]).sum()
        validation_results["uniqueness_check_transaction_id"] = (dup_count == 0)

        passed = (
            validation_results["row_count_check"]
            and validation_results["null_check_transaction_id"]
            and validation_results["null_check_customer_id"]
            and validation_results["uniqueness_check_transaction_id"]
        )
        return passed, validation_results

    # Pure Python records validation
    records = data if isinstance(data, list) else list(data)
    row_count = len(records)
    validation_results["total_rows"] = row_count
    validation_results["row_count_check"] = row_count > 0

    if row_count == 0:
        validation_results["errors"].append("Row count is 0. Threshold check failed.")
        return False, validation_results

    seen_ids = set()
    dup_ids = set()
    null_tx = 0
    null_cust = 0

    for item in records:
        tx_id = item.get("transaction_id")
        cust_id = item.get("customer_id")
        if tx_id is None or str(tx_id).strip() in ("", "None", "nan"):
            null_tx += 1
        else:
            tx_clean = str(tx_id).strip()
            if tx_clean in seen_ids:
                dup_ids.add(tx_clean)
            seen_ids.add(tx_clean)

        if cust_id is None or str(cust_id).strip() in ("", "None", "nan"):
            null_cust += 1

    validation_results["null_check_transaction_id"] = (null_tx == 0)
    validation_results["null_check_customer_id"] = (null_cust == 0)
    validation_results["uniqueness_check_transaction_id"] = (len(dup_ids) == 0)

    if null_tx > 0:
        validation_results["errors"].append(f"Found {null_tx} NULL/empty transaction_id records.")
    if null_cust > 0:
        validation_results["errors"].append(f"Found {null_cust} NULL/empty customer_id records.")
    if len(dup_ids) > 0:
        validation_results["errors"].append(f"Found duplicates for transaction_ids: {dup_ids}")

    passed = (
        validation_results["row_count_check"]
        and validation_results["null_check_transaction_id"]
        and validation_results["null_check_customer_id"]
        and validation_results["uniqueness_check_transaction_id"]
    )
    return passed, validation_results
