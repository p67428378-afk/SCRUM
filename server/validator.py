import math
import re
from typing import Any, Dict, List, Optional, Tuple

# RFC 5322 compliant regex pattern as defined in architecture specification
RFC_5322_EMAIL_REGEX = re.compile(
    r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
)


def validate_email(email: Optional[str]) -> bool:
    """Validate email address against RFC 5322 regex pattern."""
    if not email or not isinstance(email, str):
        return False
    email = email.strip()
    if not email or ".." in email:
        return False
    return bool(RFC_5322_EMAIL_REGEX.match(email))


def validate_amount(amount: Any) -> Tuple[bool, Optional[float]]:
    """Validate amount field is non-null and numeric.
    
    Returns:
        (is_valid, parsed_float_value)
    """
    if amount is None:
        return False, None
    try:
        val = float(amount)
        if math.isnan(val) or math.isinf(val):
            return False, None
        return True, val
    except (ValueError, TypeError):
        return False, None


class DataValidator:
    """Validation and filtering engine for raw sales orders."""

    @classmethod
    def validate_record(cls, record: Dict[str, Any]) -> Tuple[bool, Optional[str], Optional[Dict[str, Any]]]:
        """Validate a single sales order record.
        
        Returns:
            (is_valid, rejection_reason, cleaned_record)
        """
        raw_amount = record.get("amount")
        is_amount_valid, cleaned_amount = validate_amount(raw_amount)
        if not is_amount_valid:
            return False, "missing_or_invalid_amount", None

        raw_email = record.get("customer_email")
        if not validate_email(raw_email):
            return False, "invalid_email_rfc5322", None

        cleaned_record = {
            "order_id": str(record.get("order_id")),
            "customer_email": str(raw_email).strip(),
            "amount": cleaned_amount,
            "order_date": record.get("order_date"),
            "created_at": record.get("created_at"),
        }
        return True, None, cleaned_record

    @classmethod
    def process_batch(cls, records: List[Dict[str, Any]]) -> Tuple[List[Dict[str, Any]], Dict[str, int], List[Dict[str, Any]]]:
        """Process a batch of records, separating valid from filtered records.
        
        Returns:
            (valid_records, filter_breakdown, rejected_records_info)
        """
        valid_records: List[Dict[str, Any]] = []
        rejected_info: List[Dict[str, Any]] = []
        breakdown = {
            "missing_or_invalid_amount": 0,
            "invalid_email_rfc5322": 0
        }

        for rec in records:
            is_valid, reason, cleaned = cls.validate_record(rec)
            if is_valid and cleaned is not None:
                valid_records.append(cleaned)
            else:
                if reason and reason in breakdown:
                    breakdown[reason] += 1
                rejected_info.append({
                    "record": rec,
                    "reason": reason
                })

        return valid_records, breakdown, rejected_info
