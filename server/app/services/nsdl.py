"""
Module: nsdl
Purpose: Mock service for NSDL PAN validation.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from typing import Dict, Any


def validate_pan(pan_number: str) -> Dict[str, Any]:
    """
    Validates PAN number against mock NSDL API.
    """
    # Simple mock logic: fail if PAN starts with 'Z'
    if pan_number.startswith("Z"):
        return {
            "status": "FAILED",
            "response": {
                "error": "Invalid PAN or name mismatch",
                "code": "NSDL-404"
            }
        }
    
    return {
        "status": "VERIFIED",
        "response": {
            "pan_status": "ACTIVE",
            "category": "INDIVIDUAL",
            "last_name": "Kumar",
            "first_name": "Rajesh"
        }
    }
