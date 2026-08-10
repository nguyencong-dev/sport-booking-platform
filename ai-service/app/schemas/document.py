from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.models.enums import DocumentStatus, IngestionJobStatus, IngestionJobType


class DocumentUploadResponse(BaseModel):
    document_id: int
    job_id: int
    document_status: DocumentStatus
    job_status: IngestionJobStatus
    message: str

class DocumentListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    original_filename: str | None
    status: DocumentStatus
    is_active: bool
    created_at: datetime
    indexed_at: datetime | None

class IngestionJobDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    job_type: IngestionJobType
    status: IngestionJobStatus
    error_message: str | None
    created_at: datetime
    started_at: datetime | None
    completed_at: datetime | None

class DocumentDetailResponse(DocumentListItemResponse):
    description: str | None
    updated_at: datetime
    chunk_count: int
    latest_job: IngestionJobDetailResponse | None