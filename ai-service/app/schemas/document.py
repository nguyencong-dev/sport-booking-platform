from pydantic import BaseModel

from app.models.enums import (DocumentStatus,IngestionJobStatus)


class DocumentUploadResponse(BaseModel):
    document_id: int
    job_id: int
    document_status: DocumentStatus
    job_status: IngestionJobStatus
    message: str