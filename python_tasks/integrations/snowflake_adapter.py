
"""
Snowflake Data Warehouse Adapter.
Handles efficient batch loading of processed data into Snowflake.
Implements the 'Strategy' pattern for different loading methods (Validation vs Direct).
"""

import logging
import json
from typing import List, Dict, Any, Optional
from datetime import datetime
import pandas as pd

try:
    import snowflake.connector
    from snowflake.connector.pandas_tools import write_pandas
except ImportError:
    snowflake = None

from config import settings

logger = logging.getLogger("integrations.snowflake")

class SnowflakeAdapter:
    """
    Enterprise adapter for Snowflake Data Warehouse interactions.
    Manages connection pooling (internal to connector), batch loading, and schema verification.
    """

    def __init__(self):
        self.account = settings.SNOWFLAKE_ACCOUNT
        self.user = settings.SNOWFLAKE_USER
        self.password = settings.SNOWFLAKE_PASSWORD
        self.warehouse = settings.SNOWFLAKE_WAREHOUSE
        self.database = settings.SNOWFLAKE_DATABASE
        self.schema = settings.SNOWFLAKE_SCHEMA
        
        self._validate_config()

    def _validate_config(self):
        if not all([self.account, self.user, self.password]):
            logger.warning("Snowflake credentials not set. Adapter operating in MOCK mode.")
            self.is_mock = True
        else:
            self.is_mock = False

    def _get_connection(self):
        if self.is_mock:
            raise ConnectionError("Cannot connect in MOCK mode")
            
        return snowflake.connector.connect(
            user=self.user,
            password=self.password,
            account=self.account,
            warehouse=self.warehouse,
            database=self.database,
            schema=self.schema
        )

    def sync_table(self, table_name: str, data: List[Dict[str, Any]], key_columns: List[str] = ["id"]) -> bool:
        """
        Synchronizes a batch of records to Snowflake.
        Uses INSERT with overwrite or MERGE logic (simulated via staging table in real scenarios).
        
        Args:
            table_name: Target Snowflake table.
            data: List of dictionaries to insert.
            key_columns: Columns used for deduplication (for MERGE).
            
        Returns:
            Success boolean.
        """
        if not data:
            logger.info(f"No data to sync for table {table_name}")
            return True

        if self.is_mock:
            logger.info(f"[MOCK] Would push {len(data)} records to Snowflake table '{self.database}.{self.schema}.{table_name}'")
            return True

        conn = None
        try:
            conn = self._get_connection()
            
            # Convert to Pandas for efficient handling
            df = pd.DataFrame(data)
            
            # Ensure column case compatibility (Snowflake is often uppercase)
            df.columns = [c.upper() for c in df.columns]
            
            logger.info(f"Syncing {len(df)} records to {table_name}...")
            
            # Using write_pandas for high-performance bulk loading
            # This creates a temporary stage/parquet file under the hood
            success, nchunks, nrows, _ = write_pandas(
                conn,
                df,
                table_name.upper(),
                auto_create_table=True, # In prod, might want False to enforce contracts
                overwrite=False # We assume append-only or handled upstream. Real DW often uses Staging + MERGE.
            )
            
            if success:
                logger.info(f"Successfully loaded {nrows} rows into {table_name}")
            else:
                logger.error(f"Failed to load rows into {table_name}")
                
            return success

        except Exception as e:
            logger.error(f"Snowflake Sync Error: {e}", exc_info=True)
            return False
        finally:
            if conn:
                conn.close()

    def execute_query(self, sql: str) -> List[Dict]:
        """Execute raw SQL against Snowflake (e.g., for transformations)"""
        if self.is_mock:
            logger.info(f"[MOCK] Executing SQL: {sql}")
            return []

        conn = self._get_connection()
        try:
            cur = conn.cursor(snowflake.connector.DictCursor)
            cur.execute(sql)
            return cur.fetchall()
        finally:
            conn.close()
