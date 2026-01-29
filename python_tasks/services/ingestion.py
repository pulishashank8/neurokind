
import logging
from typing import List, Dict, Any, Union
from fastapi import APIRouter, HTTPException, Body

from models.validation import ValidatedRecord, QuarantineRecord
from services.quality import DataQualityGate

logger = logging.getLogger("ingestion_service")

router = APIRouter(prefix="/ingest", tags=["ingestion"])

class IngestionService:
    """
    Simulated Ingestion Service that effectively demonstrates the usage of DataQualityGate.
    In a real scenario, this would consume from a message queue (Kafka/RabbitMQ) or batch file processing.
    """
    
    def __init__(self):
        self.quality_gate = DataQualityGate()

    def ingest_users(self, raw_users: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Ingest a batch of user data, separating valid from invalid.
        """
        valid_records = []
        quarantine_records: List[QuarantineRecord] = []

        for raw in raw_users:
            result = self.quality_gate.validate_user(raw, source="api_batch_ingest")
            
            if isinstance(result, ValidatedRecord):
                valid_records.append(result.record)
                # Here we would proceed to write to DB using a repository
                # UserRepository.upsert(result.record) 
            else:
                quarantine_records.append(result)
                # Here we would log to a dead-letter queue or Quarantine Table
                logger.error(f"Quarantined User Record: {result.error_message}")

        return {
            "processed": len(raw_users),
            "valid": len(valid_records),
            "quarantined": len(quarantine_records),
            "quarantine_log": [q.model_dump() for q in quarantine_records]
        }

    def ingest_posts(self, raw_posts: List[Dict[str, Any]]) -> Dict[str, Any]:
        valid_records = []
        quarantine_records = []

        for raw in raw_posts:
            result = self.quality_gate.validate_post(raw, source="api_batch_ingest")
            
            if isinstance(result, ValidatedRecord):
                valid_records.append(result.record)
            else:
                quarantine_records.append(result)

        return {
            "processed": len(raw_posts),
            "valid": len(valid_records),
            "quarantined": len(quarantine_records),
            "quarantine_log": [q.model_dump() for q in quarantine_records]
        }


# API Logic to expose this Service
service = IngestionService()

@router.post("/users")
async def ingest_users_endpoint(users: List[Dict[str, Any]] = Body(...)):
    """
    Batch ingest users with Data Quality applied.
    """
    return service.ingest_users(users)

@router.post("/posts")
async def ingest_posts_endpoint(posts: List[Dict[str, Any]] = Body(...)):
    """
    Batch ingest posts with Data Quality applied.
    """
    return service.ingest_posts(posts)
