"""
Module: rbi
Purpose: Mock service for RBI Sanctions screening.
Author: Backend Developer Agent
Created: 2026-06-16
"""
from typing import Dict, Any


def screen_rbi(name: str) -> Dict[str, Any]:
    """
    Screens customer name against mock RBI sanctions list.
    """
    # Simple mock logic: flag if name contains 'Sanctioned' or 'Terrorist'
    name_lower = name.lower()
    if "sanctioned" in name_lower or "terrorist" in name_lower or "rbi_flagged" in name_lower:
        return {
            "status": "FLAGGED",
            "response": {
                "match_found": True,
                "reason": "Name matches RBI Consolidated Sanctions List",
                "category": "AML_RISK"
            }
        }
    
    return {
        "status": "CLEARED",
        "response": {
            "match_found": False,
            "reason": "No match found in RBI sanctions list"
        }
    }
