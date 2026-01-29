
import pytest
from services.quality import DataQualityGate
from models.user import User
from models.validation import ValidatedRecord, QuarantineRecord

class TestQualityGate:
    @pytest.fixture
    def gate(self):
        return DataQualityGate()

    def test_valid_user(self, gate):
        data = {
            "id": "cuid12345",
            "email": "test@example.com",
            "emailVerified": True,
            "createdAt": "2023-01-01T00:00:00",
            "updatedAt": "2023-01-01T00:00:00",
             "isBanned": False
        }
        result = gate.validate_user(data)
        assert isinstance(result, ValidatedRecord)
        assert result.record.email == "test@example.com"

    def test_invalid_email(self, gate):
        data = {
            "id": "cuid12345",
            "email": "not-an-email", 
            "createdAt": "2023-01-01T00:00:00",
            "updatedAt": "2023-01-01T00:00:00"
        }
        result = gate.validate_user(data)
        assert isinstance(result, QuarantineRecord)
        assert "validation error" in result.error_message.lower() or "value_error" in result.error_message.lower()

    def test_missing_field(self, gate):
        data = {
           "email": "test@example.com"
           # Missing ID, timestamps
        }
        result = gate.validate_user(data)
        assert isinstance(result, QuarantineRecord)
