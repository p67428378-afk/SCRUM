import logging
import random
from uuid import UUID

logger = logging.getLogger("core_banking")


def simulate_underwriting_kyc(application_data: dict) -> dict:
    """
    Simulates communication with a core banking system for underwriting/KYC.
    """
    logger.info(f"Simulating underwriting/KYC for application data: {application_data}")

    # Simple deterministic logic based on name or email for testing
    email = application_data.get("email", "").lower()
    name = application_data.get("name", "").lower()

    if "reject" in email or "reject" in name:
        return {
            "status": "rejected",
            "reason": "Failed KYC verification: Identity could not be verified against public records.",
            "reference_id": f"CORE-KYC-{random.randint(100000, 999999)}",
        }
    elif "pending" in email or "pending" in name:
        return {
            "status": "pending",
            "reason": "Underwriting review required: Additional documentation needed.",
            "reference_id": f"CORE-KYC-{random.randint(100000, 999999)}",
        }
    else:
        return {
            "status": "approved",
            "reason": "KYC and underwriting checks passed successfully.",
            "reference_id": f"CORE-KYC-{random.randint(100000, 999999)}",
        }


def sync_account_with_core(account_id: UUID) -> dict:
    """
    Simulates syncing account balance/status with the core banking system.
    """
    logger.info(f"Simulating account sync with core for account_id: {account_id}")
    return {
        "status": "synced",
        "account_id": str(account_id),
        "core_balance_match": True,
        "last_sync_status": "SUCCESS",
    }
