
import logging
import json
import uuid
from typing import Any, Dict, List, Union, Type, TypeVar
from datetime import datetime

import pandas as pd
import numpy as np
from sqlalchemy import text
from pydantic import ValidationError, BaseModel

from database import engine, get_session # Async engine
# Note: Pandas read_sql usually requires a sync connection or engine. 
# We will use an adapter or fetch async and load to DF.

# Import Pydantic models
from models.user import User
from models.post import Post
from models.comment import Comment
from models.validation import ValidatedRecord, QuarantineRecord

logger = logging.getLogger("quality_gate")

T = TypeVar("T", bound=BaseModel)

class DataQualityGate:
    """
    Enterprise Data Quality Gate.
    Validates input data against strict Pydantic models.
    Implements the 'Quarantine Pattern': invalid data is returned as QuarantineRecord rather than raising exceptions.
    """
    
    def validate(self, model_class: Type[T], data: Union[Dict[str, Any], str], source: str = "unknown") -> Union[ValidatedRecord[T], QuarantineRecord]:
        try:
            if isinstance(data, str):
                try:
                    data_dict = json.loads(data)
                except json.JSONDecodeError as e:
                     return QuarantineRecord(
                        raw_data=data,
                        error_message=f"JSON Decode Error: {str(e)}",
                        source=source,
                        model_name=model_class.__name__
                    )
            else:
                data_dict = data

            validated_instance = model_class.model_validate(data_dict)
            
            return ValidatedRecord(
                record=validated_instance,
                metadata={
                    "validation_source": "DataQualityGate",
                    "validated_at": datetime.now()
                }
            )

        except ValidationError as e:
            logger.warning(f"Validation failed for {model_class.__name__}: {e.json()}")
            return QuarantineRecord(
                raw_data=data,
                error_message=e.json(),
                source=source,
                model_name=model_class.__name__
            )
        except Exception as e:
            logger.error(f"Unexpected error validating {model_class.__name__}: {e}")
            return QuarantineRecord(
                raw_data=data,
                error_message=str(e),
                source=source,
                model_name=model_class.__name__
            )

    def validate_user(self, data: Any, source: str = "ingestion") -> Union[ValidatedRecord[User], QuarantineRecord]:
        return self.validate(User, data, source)

    def validate_post(self, data: Any, source: str = "ingestion") -> Union[ValidatedRecord[Post], QuarantineRecord]:
        return self.validate(Post, data, source)

    def validate_comment(self, data: Any, source: str = "ingestion") -> Union[ValidatedRecord[Comment], QuarantineRecord]:
        return self.validate(Comment, data, source)


# =============================================================================
# EXISTING QUALITY CHECK LOGIC (Refactored for Async)
# =============================================================================

async def run_quality_checks():
    """
    Executes all active data quality rules from the database.
    """
    async with get_session() as conn:
        # Fetch active rules
        rules_query = text("SELECT * FROM \"DataQualityRule\" WHERE \"isActive\" = true")
        result = await conn.execute(rules_query)
        # Convert to Pandas safely
        rules_df = pd.DataFrame(result.mappings().all())
        
        results = []
        
        for _, rule in rules_df.iterrows():
            rule_type = rule['ruleType']
            dataset_id = rule['datasetId']
            criteria = rule['criteria'] # JSON dict
            
            # Fetch target table name
            table_query = text("SELECT name FROM \"Dataset\" WHERE id = :id")
            table_name = (await conn.execute(table_query, {"id": dataset_id})).scalar()
            
            if not table_name:
                continue

            # Route to specific check logic
            if rule_type == 'ANOMALY_DETECTION':
                result = await run_anomaly_check(conn, rule['id'], table_name, rule['fieldName'], criteria)
                results.append(result)
            elif rule_type == 'NULL_CHECK':
                result = await run_null_check(conn, rule['id'], table_name, rule['fieldName'])
                results.append(result)
            
    return results

async def run_anomaly_check(conn, rule_id, table_name, column, criteria):
    """
    Runs Z-Score Anomaly Detection on a numerical column.
    """
    threshold = criteria.get('threshold', 3)
    
    # Load data
    query = text(f"SELECT id, \"{column}\" as val FROM \"{table_name}\" WHERE \"{column}\" IS NOT NULL")
    result = await conn.execute(query)
    df = pd.DataFrame(result.mappings().all())
    
    if df.empty:
        return {"ruleId": rule_id, "status": "SKIPPED", "failures": 0}

    # Calculate Z-Score
    df['z_score'] = (df['val'] - df['val'].mean()) / df['val'].std()
    
    # Find anomalies
    anomalies = df[np.abs(df['z_score']) > threshold]
    failure_count = len(anomalies)
    
    # Store result
    status = "FAIL" if failure_count > 0 else "PASS"
    
    insert_query = text("""
        INSERT INTO "DataQualityResult" ("id", "ruleId", "status", "recordsChecked", "failuresFound", "anomalyScore", "runDate", "updatedAt")
        VALUES (:id, :ruleId, :status, :recordsChecked, :failuresFound, :anomalyScore, NOW(), NOW())
    """)
    
    await conn.execute(insert_query, {
        "id": str(uuid.uuid4()),
        "ruleId": rule_id,
        "status": status,
        "recordsChecked": len(df),
        "failuresFound": failure_count,
        "anomalyScore": df['z_score'].abs().max() if not df.empty else 0
    })
    await conn.commit()
    
    return {"ruleId": rule_id, "status": status, "failures": failure_count}

async def run_null_check(conn, rule_id, table_name, column):
    query = text(f"SELECT count(*) FROM \"{table_name}\" WHERE \"{column}\" IS NULL")
    failures = (await conn.execute(query)).scalar()
    
    status = "FAIL" if failures > 0 else "PASS"
    
    insert_query = text("""
        INSERT INTO "DataQualityResult" ("id", "ruleId", "status", "recordsChecked", "failuresFound", "runDate", "updatedAt")
        VALUES (:id, :ruleId, :status, :recordsChecked, :failuresFound, NOW(), NOW())
    """)
    
    # Get total count for recordsChecked
    total = (await conn.execute(text(f"SELECT count(*) FROM \"{table_name}\""))).scalar()

    await conn.execute(insert_query, {
        "id": str(uuid.uuid4()),
        "ruleId": rule_id,
        "status": status,
        "recordsChecked": total,
        "failuresFound": failures
    })
    await conn.commit()
    
    return {"ruleId": rule_id, "status": status, "failures": failures}
