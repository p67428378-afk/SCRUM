"""Data validation, cleaning, deduplication, and quarantine handler for retail orders."""

from datetime import datetime, timezone, date
from decimal import Decimal
import json
import logging
from typing import Any, Dict, List, Optional, Tuple, Union

from pipeline.currency import CurrencyNormalizer

logger = logging.getLogger(__name__)


def parse_date_str(value: Any) -> Optional[str]:
    """Parse a date value into YYYY-MM-DD format string."""
    if value is None or (isinstance(value, float) and value != value):
        return None

    if isinstance(value, date) and not isinstance(value, datetime):
        return value.isoformat()

    if isinstance(value, datetime):
        return value.date().isoformat()

    val_str = str(value).strip()
    if not val_str:
        return None

    formats = [
        "%Y-%m-%d",
        "%Y/%m/%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%Y%m%d",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(val_str, fmt).date().isoformat()
        except ValueError:
            pass

    # Try ISO timestamp parse and extract date
    try:
        dt = datetime.fromisoformat(val_str.replace("Z", "+00:00"))
        return dt.date().isoformat()
    except Exception:
        return None


def parse_timestamp_str(value: Any) -> Optional[str]:
    """Parse a timestamp value into standardized ISO UTC format string."""
    if value is None or (isinstance(value, float) and value != value):
        return None

    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

    val_str = str(value).strip()
    if not val_str:
        return None

    # Handle ISO formats
    try:
        dt = datetime.fromisoformat(val_str.replace("Z", "+00:00"))
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt.astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    except Exception:
        pass

    # Handle common datetime patterns
    formats = [
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y/%m/%d %H:%M:%S",
        "%d-%m-%Y %H:%M:%S",
        "%m/%d/%Y %H:%M:%S",
    ]
    for fmt in formats:
        try:
            dt = datetime.strptime(val_str, fmt).replace(tzinfo=timezone.utc)
            return dt.strftime("%Y-%m-%dT%H:%M:%SZ")
        except ValueError:
            pass

    return None


class RetailOrderCleaner:
    """Validator, deduplicator, and transformer for raw retail order records."""

    def __init__(self, currency_normalizer: Optional[CurrencyNormalizer] = None):
        self.currency_normalizer = currency_normalizer or CurrencyNormalizer()

    def validate_and_clean_record(
        self,
        raw_row: Dict[str, Any],
        source_filename: str = "unknown.csv",
        ingested_at: Optional[str] = None,
    ) -> Tuple[Optional[Dict[str, Any]], Optional[Dict[str, Any]]]:
        """
        Validate and normalize a single raw record.

        Returns:
            Tuple of (cleaned_record, quarantine_record).
            Exactly one of the tuple elements will be non-None.
        """
        now_utc = ingested_at or datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")

        # Map alternate column names
        order_id = raw_row.get("order_id") or raw_row.get("OrderID") or raw_row.get("id")
        customer_id = raw_row.get("customer_id") or raw_row.get("CustomerID") or raw_row.get("user_id")
        order_date_raw = raw_row.get("order_date") or raw_row.get("OrderDate") or raw_row.get("date")
        order_ts_raw = raw_row.get("order_timestamp") or raw_row.get("OrderTimestamp") or raw_row.get("timestamp") or order_date_raw
        amount_raw = raw_row.get("original_amount") or raw_row.get("amount") or raw_row.get("Amount")
        currency_raw = raw_row.get("original_currency") or raw_row.get("currency") or raw_row.get("Currency") or "USD"
        item_count_raw = raw_row.get("item_count") or raw_row.get("quantity") or raw_row.get("ItemCount")
        status_raw = raw_row.get("status") or raw_row.get("Status") or "COMPLETED"

        # Validation: Mandatory order_id
        if not order_id or not str(order_id).strip():
            return None, {
                "failure_reason": "Missing or empty mandatory field: order_id",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        order_id = str(order_id).strip()

        # Validation: Mandatory customer_id
        if not customer_id or not str(customer_id).strip():
            return None, {
                "failure_reason": "Missing or empty mandatory field: customer_id",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        customer_id = str(customer_id).strip()

        # Validation: Date parsing
        order_date_parsed = parse_date_str(order_date_raw)
        if not order_date_parsed:
            return None, {
                "failure_reason": f"Invalid or unparseable order_date: '{order_date_raw}'",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        # Validation: Timestamp parsing
        order_ts_parsed = parse_timestamp_str(order_ts_raw)
        if not order_ts_parsed:
            # Fallback to date start of day
            order_ts_parsed = f"{order_date_parsed}T00:00:00Z"

        # Validation: Amount numeric check & non-negative
        if amount_raw is None:
            return None, {
                "failure_reason": "Missing mandatory field: amount/original_amount",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        try:
            original_amount_dec = Decimal(str(amount_raw).strip())
            if original_amount_dec < 0:
                return None, {
                    "failure_reason": f"Negative transaction amount not allowed: '{amount_raw}'",
                    "raw_record": json.dumps(raw_row, default=str),
                    "source_filename": source_filename,
                    "quarantined_at": now_utc,
                }
        except Exception as ex:
            return None, {
                "failure_reason": f"Unparseable numeric amount: '{amount_raw}' ({ex})",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        # Currency code validation & normalization
        currency_code = str(currency_raw).strip().upper()
        if not currency_code or len(currency_code) < 3:
            return None, {
                "failure_reason": f"Invalid currency code: '{currency_raw}'",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        # Currency conversion to USD
        try:
            amount_usd, exchange_rate = self.currency_normalizer.convert_to_usd(
                amount=original_amount_dec,
                currency=currency_code,
                rate_date=order_date_parsed,
            )
        except Exception as ex:
            return None, {
                "failure_reason": f"Currency conversion error: {ex}",
                "raw_record": json.dumps(raw_row, default=str),
                "source_filename": source_filename,
                "quarantined_at": now_utc,
            }

        # Parse optional item_count
        item_count: Optional[int] = None
        if item_count_raw is not None and str(item_count_raw).strip() != "":
            try:
                item_count = int(float(str(item_count_raw).strip()))
                if item_count < 0:
                    item_count = 0
            except Exception:
                item_count = None

        # Format status
        status_clean = str(status_raw).strip().upper() if status_raw else "COMPLETED"

        cleaned_record = {
            "order_id": order_id,
            "customer_id": customer_id,
            "order_date": order_date_parsed,
            "order_timestamp": order_ts_parsed,
            "original_amount": float(original_amount_dec),
            "original_currency": currency_code,
            "exchange_rate_used": float(exchange_rate),
            "amount_usd": float(amount_usd),
            "item_count": item_count,
            "status": status_clean,
            "ingested_at": now_utc,
            "source_filename": source_filename,
        }

        return cleaned_record, None

    def process_batch(
        self,
        records: List[Dict[str, Any]],
        source_filename: str = "batch_input.csv",
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], int]:
        """
        Process a list of raw records: validate, clean, deduplicate by order_id, and quarantine.

        Returns:
            Tuple of:
            - deduplicated_valid_records: List[Dict[str, Any]]
            - quarantined_records: List[Dict[str, Any]]
            - raw_valid_count: int (number of valid records before deduplication)
        """
        now_utc = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
        valid_records: List[Dict[str, Any]] = []
        quarantined_records: List[Dict[str, Any]] = []

        for row in records:
            cleaned, quarantined = self.validate_and_clean_record(
                raw_row=row,
                source_filename=source_filename,
                ingested_at=now_utc,
            )
            if cleaned:
                valid_records.append(cleaned)
            elif quarantined:
                quarantined_records.append(quarantined)

        raw_valid_count = len(valid_records)

        # Deduplication by order_id: retain record with the latest order_timestamp
        dedup_map: Dict[str, Dict[str, Any]] = {}
        for rec in valid_records:
            oid = rec["order_id"]
            if oid not in dedup_map:
                dedup_map[oid] = rec
            else:
                existing_ts = dedup_map[oid]["order_timestamp"]
                current_ts = rec["order_timestamp"]
                # If current has newer or equal timestamp, replace
                if current_ts >= existing_ts:
                    dedup_map[oid] = rec

        deduplicated_valid_records = list(dedup_map.values())

        return deduplicated_valid_records, quarantined_records, raw_valid_count
