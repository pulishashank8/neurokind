
import pytest
from services.governance import PrivacyService, RiskLevel

class TestPrivacyService:
    @pytest.fixture
    def privacy_service(self):
        return PrivacyService()

    def test_redaction(self, privacy_service):
        text = "My phone is 555-123-4567 and my DOB is 01/01/1980."
        redacted, findings, risk = privacy_service.scan_and_redact(text)
        
        assert "(XXX) XXX-XXXX" in redacted or "555-123-4567" not in redacted
        assert "XX/XX/XXXX" in redacted or "01/01/1980" not in redacted
        assert len(findings) == 2
        assert risk in [RiskLevel.MEDIUM, RiskLevel.HIGH]

    def test_high_risk_triggers(self, privacy_service):
        text = "SSN: 123-45-6789"
        _, findings, risk = privacy_service.scan_and_redact(text)
        
        types = [f['type'] for f in findings]
        assert "SSN" in types
        assert risk == RiskLevel.HIGH

    def test_benign_text(self, privacy_service):
        text = "Hello world, this is a clean string."
        redacted, findings, risk = privacy_service.scan_and_redact(text)
        
        assert redacted == text
        assert len(findings) == 0
        assert risk == RiskLevel.LOW
