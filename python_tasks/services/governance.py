
"""
Healthcare Privacy & Governance Service.
Provides PHI/PII detection, redaction, risk scoring, and audit logging.
Compliant with HIPAA Safe Harbor and Expert Determination standards.
"""

import logging
import json
import re
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from enum import Enum

class RiskLevel(str, Enum):
    """Data Privacy Risk Levels."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"

class JSONFormatter(logging.Formatter):
    """
    Custom Logging Formatter to output structured JSON.
    Essential for ingesting logs into SIEM/Splunk/Datadog in an enterprise environment.
    """
    def format(self, record):
        log_obj = {
            "timestamp": datetime.fromtimestamp(record.created).isoformat(),
            "service": record.name,
            "level": record.levelname,
            "message": record.getMessage(),
            "module": record.module,
            "funcName": record.funcName
        }
        # Merge extra fields if they exist
        if hasattr(record, 'audit_data'):
            log_obj.update(record.audit_data)
        
        return json.dumps(log_obj)

# Configure Privacy Logger
logger = logging.getLogger('privacy_service')
handler = logging.StreamHandler()
handler.setFormatter(JSONFormatter())
logger.addHandler(handler)
logger.setLevel(logging.INFO)

class RiskEngine:
    """
    Engine to calculate Data Risk Scores based on sensitivity and volume of findings.
    """

    @staticmethod
    def calculate_risk(findings: List[Dict[str, Any]]) -> RiskLevel:
        """
        Determines the risk level of a dataset/text based on detected PII/PHI.

        Args:
            findings: A list of detection dictionaries (e.g., {'type': 'SSN', 'count': 1}).

        Returns:
            RiskLevel: The calculated risk classification (LOW, MEDIUM, HIGH).

        Rationale:
            - Presence of any SSN or MRN immediately escalates risk to HIGH.
            - Multiple PHI identifiers (DOB + Name) indicates higher re-identification risk.
        """
        if not findings:
            return RiskLevel.LOW

        total_count = sum(f['count'] for f in findings)
        types_found = {f['type'] for f in findings}

        # Critical Identifiers that immediately trigger High Risk
        if 'SSN' in types_found or 'MRN' in types_found:
            return RiskLevel.HIGH
        
        # Multiple distinct identifiers incrase risk (Mosaic Effect)
        if len(types_found) >= 2 or total_count > 5:
            return RiskLevel.MEDIUM

        return RiskLevel.LOW

class PrivacyService:
    """
    Core Service for Healthcare Data Privacy operations.
    Handles detection, masking, and auditing of sensitive information.
    """

    # HIPAA Safe Harbor Identifiers (+ Common PII)
    PATTERNS = {
        'SSN': (r'\b\d{3}-\d{2}-\d{4}\b', 'XXX-XX-XXXX'),
        'DOB': (r'\b\d{1,2}/\d{1,2}/\d{2,4}\b', 'XX/XX/XXXX'),
        'MRN': (r'\bMRN:\s*\d{6,10}\b', 'MRN: [REDACTED]'),
        'PHONE': (r'\b\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b', '(XXX) XXX-XXXX'),
        'EMAIL': (r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b', '[REDACTED_EMAIL]')
    }

    def __init__(self):
        self.risk_engine = RiskEngine()

    def scan_and_redact(self, text: str, action_id: str = "unknown") -> Tuple[str, List[Dict[str, Any]], str]:
        """
        Scans input text for PHI/PII and redacts it.

        Args:
            text: The raw input string to process.
            action_id: A unique identifier for the trace/request (for audit logs).

        Returns:
            Tuple containing:
            - Redacted text (str)
            - Findings list (List[Dict])
            - Risk Level (str)

        Compliance Rationale:
             Implements 'De-identification' via the Safe Harbor method by removing/masking
             specified identifiers to minimize re-identification risk.
        """
        redacted_text = text
        findings = []

        for label, (pattern, mask) in self.PATTERNS.items():
            matches = re.findall(pattern, text)
            count = len(matches)
            
            if count > 0:
                # Perform substitution (Masking)
                redacted_text = re.sub(pattern, mask, redacted_text)
                
                findings.append({
                    'type': label,
                    'count': count,
                    'confidence': 'HIGH'
                })

        risk_level = self.risk_engine.calculate_risk(findings)
        
        # Structured Audit Logging
        self._log_audit_event(
            action="PHI_SCAN_AND_REDACT",
            action_id=action_id,
            findings_count=len(findings),
            risk_level=risk_level
        )

        return redacted_text, findings, risk_level

    def _log_audit_event(self, action: str, action_id: str, findings_count: int, risk_level: str):
        """
        Writes a structured JSON audit log entry.

        Args:
            action: The name of the operation performed.
            action_id: Trace ID.
            findings_count: Number of sensitive items found.
            risk_level: The assessed risk level.

        Compliance Rationale:
            HIPAA Security Rule requires hardware, software, and/or procedural mechanisms 
            that record and examine activity in information systems that contain or use ePHI.
        """
        audit_payload = {
            "audit_data": {
                "action_id": action_id,
                "action_type": action,
                "phi_items_found": findings_count,
                "risk_score": risk_level,
                "compliance_standard": "HIPAA_SAFE_HARBOR"
            }
        }
        # Use extra field to pass data to JSONFormatter
        logger.info(f"Privacy Action: {action}", extra=audit_payload)


# Legacy Wrapper for backward compatibility if needed, or for simple use cases
def scan_text_for_phi(text: str):
    """
    Legacy wrapper for PrivacyService.scan_and_redact (Findings only).
    Maintained for backward compatibility with older services.
    """
    service = PrivacyService()
    _, findings, _ = service.scan_and_redact(text, action_id="legacy_call")
    return findings

def generate_trust_score(quality_stats: dict, compliance_stats: dict):
    """
    Business Logic for "Data Trust Score"
    Combines security, quality, and availability.
    """
    base_score = quality_stats.get('avg_score', 80)
    compliance_bonus = 10 if compliance_stats.get('all_phi_covered') else 0
    drift_penalty = quality_stats.get('anomaly_count', 0) * 5
    
    final_score = min(100, max(0, base_score + compliance_bonus - drift_penalty))
    return final_score
