"""
Module: cibil
Purpose: Mock service for CIBIL Fraud Registry screening.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from typing import Dict, Any


def screen_cibil(name: str, consent: bool) -> Dict[str, Any]:
    """
    Screens customer name against mock CIBIL fraud registry.
    """
    if not consent:
        return {
            "status": "FLAGGED",
            "response": {
                "error": "CIBIL consent not provided",
                "code": "CIBIL-400"
            }
        }

    # Simple mock logic: flag if name contains 'Amit Patel' or 'Fraud'
    name_lower = name.lower()
    if "amit patel" in name_lower or "fraud" in name_lower or "cibil_flagged" in name_lower:
        return {
            "status": "FLAGGED",
            "response": {
                "match_found": True,
                "reason": "Name matches CIBIL Fraud Registry",
                "category": "FRAUD_RISK"
            }
        }
    
    return {
        "status": "CLEARED",
        "response": {
            "match_found": False,
            "reason": "No match found in CIBIL fraud registry"
        }
    }
