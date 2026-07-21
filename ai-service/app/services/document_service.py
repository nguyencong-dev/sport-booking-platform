from fastapi import UploadFile
from sqlalchemy.orm import Session

from app.models.ingestion_job import IngestionJob
from app.models.knowledge_document import (
    KnowledgeDocument,
)
from app.repositories.ingestion_job_repository import (
    IngestionJobRepository,
)
from app.repositories.knowledge_document_repository import (
    KnowledgeDocumentRepository,
)
from app.services.file_storage_service import (
    FileStorageService,
)


class DocumentService:
    def __init__(self) -> None:
        self.file_storage = FileStorageService()
        self.document_repository = (
            KnowledgeDocumentRepository()
        )
        self.job_repository = (
            IngestionJobRepository()
        )

    def upload_pdf(
        self,
        db: Session,
        *,
        upload: UploadFile,
        title: str | None,
    ) -> tuple[KnowledgeDocument, IngestionJob]:
        stored_pdf = self.file_storage.save_pdf(
            upload
        )

        try:
            document = (
                self.document_repository.create_pdf(
                    db,
                    title=title or stored_pdf.original_filename,
                    source_uri=str(stored_pdf.path),
                    original_filename=(
                        stored_pdf.original_filename
                    ),
                    checksum=stored_pdf.checksum,
                )
            )

            job = self.job_repository.create_pdf_job(
                db,
                document_id=document.id,
            )

            db.commit()
            db.refresh(document)
            db.refresh(job)

            return document, job

        except Exception:
            db.rollback()
            stored_pdf.path.unlink(
                missing_ok=True,
            )
            raise