from datetime import datetime
from typing import Any, Dict, Optional, Union, Generic, TypeVar
from pydantic import BaseModel, Field

ModelType = TypeVar("ModelType", bound=BaseModel)

class CheckResult(BaseModel):
    is_valid: bool
    errors: list[str] = []

class QuarantineRecord(BaseModel):
    raw_data: Any = Field(..., description="The raw input data that failed validation")
    error_message: str = Field(..., description="Description of why validation failed")
    timestamp: datetime = Field(default_factory=datetime.now, description="When the failure occurred")
    source: str = Field(..., description="Source of the data (e.g., 'ingestion_pipeline')")
    model_name: str = Field(..., description="Name of the model validation was attempted against")

class ValidatedRecord(BaseModel, Generic[ModelType]):
    record: ModelType = Field(..., description="The successfully validated Pydantic model")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata about the validation/ingestion")
    timestamp: datetime = Field(default_factory=datetime.now)
