"""Data Validation & Filtering Engine."""
import re
import math
from typing import Any, List, Tuple
from server.models import FctSalesOrder, FilterBreakdown, RawSalesOrder

RFC_5322_EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")


class DataValidator:
    """Validates and filters raw sales order records."""

    @staticmethod
    def validate_amount(amount: Any) -> Tuple[bool, float]:
        """Validate if amount is present and a valid numeric value."""
        if amount is None:
            return False, 0.0
        try:
            val = float(amount)
            if math.isnan(val) or math.isinf(val):
                return False, 0.0
            return True, val
        except (ValueError, TypeError):
            return False, 0.0

    @staticmethod
    def validate_email(email: Any) -> bool:
        """Validate customer email against RFC 5322 syntax regex."""
        if not email or not isinstance(email, str):
            return False
        return bool(RFC_5322_EMAIL_REGEX.match(email.strip()))

    @classmethod
    def validate_records(
        cls, raw_records: List[RawSalesOrder]
    ) -> Tuple[List[FctSalesOrder], FilterBreakdown]:
        """
        Filters raw records into valid target records and counts rejections.
        Rule 1: Rejects missing or non-numeric amount.
        Rule 2: Rejects invalid RFC 5322 email.
        """
        valid_records: List[FctSalesOrder] = []
        breakdown = FilterBreakdown(missing_or_invalid_amount=0, invalid_email_rfc5322=0)

        for record in raw_records:
            # Rule 1: Amount Validation
            is_valid_amount, numeric_amount = cls.validate_amount(record.amount)
            if not is_valid_amount:
                breakdown.missing_or_invalid_amount += 1
                continue

            # Rule 2: Email Validation
            if not cls.validate_email(record.customer_email):
                breakdown.invalid_email_rfc5322 += 1
                continue

            # Both passed: Construct valid FctSalesOrder
            valid_order = FctSalesOrder(
                order_id=record.order_id,
                customer_email=record.customer_email.strip(),
                amount=numeric_amount,
                order_date=record.order_date,
                created_at=record.created_at,
            )
            valid_records.append(valid_order)

        return valid_records, breakdown
