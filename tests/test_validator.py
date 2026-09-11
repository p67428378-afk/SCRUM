import pytest
from server.validator import DataValidator, validate_amount, validate_email


class TestEmailValidation:
    """Test RFC 5322 email regex validation logic."""

    @pytest.mark.parametrize("valid_email", [
        "user@example.com",
        "john.doe@company.org",
        "alice+marketing@domain.co.uk",
        "customer_123@sub.domain.net",
        "first-name.last-name@example.io",
    ])
    def test_valid_emails(self, valid_email):
        assert validate_email(valid_email) is True

    @pytest.mark.parametrize("invalid_email", [
        "",
        None,
        "   ",
        "plainaddress",
        "@missingusername.com",
        "missingatsign.com",
        "user@.com",
        "user@domain..com",
        "user@domain",
        12345,
    ])
    def test_invalid_emails(self, invalid_email):
        assert validate_email(invalid_email) is False


class TestAmountValidation:
    """Test amount validation and numeric parsing logic."""

    @pytest.mark.parametrize("valid_input, expected_val", [
        (100.50, 100.50),
        (50, 50.0),
        ("99.99", 99.99),
        ("1500", 1500.0),
        (0.0, 0.0),
    ])
    def test_valid_amounts(self, valid_input, expected_val):
        is_valid, parsed = validate_amount(valid_input)
        assert is_valid is True
        assert parsed == expected_val

    @pytest.mark.parametrize("invalid_input", [
        None,
        "",
        "invalid_amount",
        "N/A",
        float("nan"),
        float("inf"),
        float("-inf"),
    ])
    def test_invalid_amounts(self, invalid_input):
        is_valid, parsed = validate_amount(invalid_input)
        assert is_valid is False
        assert parsed is None


class TestRecordAndBatchValidation:
    """Test single record and batch processing through DataValidator."""

    def test_validate_record_success(self):
        record = {
            "order_id": "ord-001",
            "customer_email": "buyer@test.com",
            "amount": "250.75",
            "order_date": "2025-01-15",
            "created_at": "2025-01-15T10:00:00Z"
        }
        is_valid, reason, cleaned = DataValidator.validate_record(record)
        assert is_valid is True
        assert reason is None
        assert cleaned["order_id"] == "ord-001"
        assert cleaned["customer_email"] == "buyer@test.com"
        assert cleaned["amount"] == 250.75

    def test_validate_record_missing_amount(self):
        record = {
            "order_id": "ord-002",
            "customer_email": "buyer@test.com",
            "amount": None,
            "order_date": "2025-01-15",
            "created_at": "2025-01-15T10:00:00Z"
        }
        is_valid, reason, cleaned = DataValidator.validate_record(record)
        assert is_valid is False
        assert reason == "missing_or_invalid_amount"
        assert cleaned is None

    def test_validate_record_invalid_email(self):
        record = {
            "order_id": "ord-003",
            "customer_email": "invalid_email_format",
            "amount": 120.0,
            "order_date": "2025-01-15",
            "created_at": "2025-01-15T10:00:00Z"
        }
        is_valid, reason, cleaned = DataValidator.validate_record(record)
        assert is_valid is False
        assert reason == "invalid_email_rfc5322"
        assert cleaned is None

    def test_process_batch_summary(self):
        records = [
            {"order_id": "1", "customer_email": "ok1@domain.com", "amount": 100.0, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
            {"order_id": "2", "customer_email": "ok2@domain.com", "amount": None, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
            {"order_id": "3", "customer_email": "bad_email", "amount": 200.0, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
            {"order_id": "4", "customer_email": "ok3@domain.com", "amount": "invalid", "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
            {"order_id": "5", "customer_email": "ok4@domain.com", "amount": 350.50, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
        ]
        valid_records, breakdown, rejected_info = DataValidator.process_batch(records)
        assert len(valid_records) == 2
        assert breakdown["missing_or_invalid_amount"] == 2
        assert breakdown["invalid_email_rfc5322"] == 1
        assert len(rejected_info) == 3
