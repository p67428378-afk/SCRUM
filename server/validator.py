"""Data validation and filtering engine for sales orders."""
import re
from typing import Any, Dict, List, Tuple
from server.models import FilterBreakdown, FctSalesOrder

# RFC 5322 email regex pattern
EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


def validate_and_filter_records(
    raw_records: List[Dict[str, Any]]
) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]], FilterBreakdown]:
    """
    Validates raw sales order records and applies filtering rules.

    Rules:
    1. Amount Validation: Rejects records where amount is NULL, missing, or non-numeric.
    2. Email Validation: Rejects records where customer_email is NULL or invalid per RFC 5322.

    Returns:
        valid_records: List of cleaned valid record dicts.
        rejected_records: List of rejected records with reason code.
        breakdown: Count breakdown of rejections.
    """
    valid_records: List[Dict[str, Any]] = []
    rejected_records: List[Dict[str, Any]] = []
    breakdown = FilterBreakdown(missing_or_invalid_amount=0, invalid_email_rfc5322=0)

    for record in raw_records:
        order_id = record.get("order_id")
        raw_amount = record.get("amount")
        raw_email = record.get("customer_email")
        order_date = record.get("order_date")
        created_at = record.get("created_at")

        # Check 1: Amount validation
        if raw_amount is None:
            breakdown.missing_or_invalid_amount += 1
            rejected_records.append({
                "record": record,
                "reason": "missing_or_invalid_amount",
                "detail": "Amount is None/missing"
            })
            continue

        try:
            amount_float = float(raw_amount)
            import math
            if math.isnan(amount_float) or math.isinf(amount_float):
                raise ValueError("Amount is NaN or Inf")
        except (ValueError, TypeError):
            breakdown.missing_or_invalid_amount += 1
            rejected_records.append({
                "record": record,
                "reason": "missing_or_invalid_amount",
                "detail": f"Cannot convert amount '{raw_amount}' to float"
            })
            continue

        # Check 2: Email validation (RFC 5322)
        if not raw_email or not isinstance(raw_email, str) or not EMAIL_REGEX.match(raw_email.strip()):
            breakdown.invalid_email_rfc5322 += 1
            rejected_records.append({
                "record": record,
                "reason": "invalid_email_rfc5322",
                "detail": f"Invalid email format: '{raw_email}'"
            })
            continue

        # Check order_date and created_at presence
        if not order_date:
            breakdown.missing_or_invalid_amount += 1
            rejected_records.append({
                "record": record,
                "reason": "missing_order_date",
                "detail": "Order date is missing"
            })
            continue

        valid_records.append({
            "order_id": str(order_id),
            "customer_email": raw_email.strip(),
            "amount": float(amount_float),
            "order_date": order_date,
            "created_at": created_at
        })

    return valid_records, rejected_records, breakdown
