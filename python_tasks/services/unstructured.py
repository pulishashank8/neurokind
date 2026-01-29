
import os
import markdown
import re
from sqlalchemy import text
from database import get_session

DOCS_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "docs")

async def scan_policies():
    """
    Scans the /docs directory for markdown files.
    Parses them to extract "Data Policy" sections.
    Updates or creates Dataset entries in the specific 'Policies' domain.
    """
    if not os.path.exists(DOCS_DIR):
        return {"status": "skipped", "reason": "docs directory not found"}

    scanned_files = []
    
    async with get_session() as conn:
        for filename in os.listdir(DOCS_DIR):
            if not filename.endswith(".md"):
                continue
                
            filepath = os.path.join(DOCS_DIR, filename)
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    content = f.read()
            except Exception:
                continue
                
            dataset_name = filename.replace(".md", "").replace("_", " ").title()
            
            upsert_query = text("""
                INSERT INTO "Dataset" ("id", "name", "description", "domain", "ownerTeam", "sensitivity", "createdAt", "updatedAt")
                VALUES (:id, :name, :description, 'Policy Documentation', 'Legal', 'PUBLIC', NOW(), NOW())
                ON CONFLICT ("name") 
                DO UPDATE SET "description" = :description, "updatedAt" = NOW()
            """)
            
            import uuid
            # Deterministic ID based on name would be better, but UUID for now
            
            await conn.execute(upsert_query, {
                "id": str(uuid.uuid4()),
                "name": dataset_name,
                "description": f"Automatically scanned policy document. Source: {filename}. Size: {len(content)} bytes.",
            })
            scanned_files.append(dataset_name)
            
        await conn.commit()
        
    return {"status": "success", "scanned": scanned_files}
