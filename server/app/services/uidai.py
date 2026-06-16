"""
Module: uidai
Purpose: Mock service for UIDAI Aadhaar validation.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from typing import Dict, Any


def validate_aadhaar(aadhaar_number: str) -> Dict[str, Any]:
    """
    Validates Aadhaar number against mock UIDAI API.
    """
    # Simple mock logic: fail if aadhaar starts with '9'
    if aadhaar_number.startswith("9"):
        return {
            "status": "FAILED",
            "response": {
                "error": "Aadhaar number not found or inactive",
                "code": "UIDAI-404"
            }
        }
    
    return {
        "status": "VERIFIED",
        "response": {
            "reference_id": "UIDAI-REF-123456",
            "name_match": True,
            "address_verified": True,
            "gender": "M",
            "dob": "1990-01-01"
        }
    }
