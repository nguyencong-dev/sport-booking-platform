from sqlalchemy.orm import Session

from app.models.enums import (
    IngestionJobStatus,
    IngestionJobType,
)
from app.models.ingestion_job import IngestionJob


class IngestionJobRepository:
    def create_pdf_job(
        self,
        db: Session,
        document_id: int,
    ) -> IngestionJob:
        job = IngestionJob(
            document_id=document_id,
            job_type=IngestionJobType.PDF_INGESTION,
            status=IngestionJobStatus.PENDING,
        )

        db.add(job)
        db.flush()

        return job

    def get_by_id(
        self,
        db: Session,
        job_id: int,
    ) -> IngestionJob | None:
        return db.get(
            IngestionJob,
            job_id,
        )