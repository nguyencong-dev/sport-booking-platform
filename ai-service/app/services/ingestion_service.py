import logging
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.enums import (
    DocumentStatus,
    IngestionJobStatus,
)
from app.models.ingestion_job import IngestionJob
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.knowledge_document import (
    KnowledgeDocument,
)
from app.rag.embedding_service import EmbeddingService
from app.rag.pdf_loader import PDFLoader
from app.rag.text_splitter import DocumentTextSplitter
from app.repositories.knowledge_chunk_repository import (
    KnowledgeChunkRepository,
)


logger = logging.getLogger(__name__)


class IngestionService:
    def __init__(self) -> None:
        self.pdf_loader = PDFLoader()
        self.text_splitter = DocumentTextSplitter()
        self.embedding_service = EmbeddingService()
        self.chunk_repository = (
            KnowledgeChunkRepository()
        )

    def ingest_pdf(
        self,
        db: Session,
        *,
        document_id: int,
        job_id: int,
    ) -> None:
        document = db.get(
            KnowledgeDocument,
            document_id,
        )
        job = db.get(
            IngestionJob,
            job_id,
        )

        if document is None:
            raise ValueError(
                "Không tìm thấy document"
            )

        if job is None:
            raise ValueError(
                "Không tìm thấy ingestion job"
            )

        document.status = DocumentStatus.PROCESSING
        document.is_active = False

        job.status = IngestionJobStatus.PROCESSING
        job.started_at = datetime.now(
            timezone.utc
        )
        job.error_message = None

        db.commit()

        source_path = Path(
            document.source_uri or ""
        )

        if not source_path.is_file():
            raise FileNotFoundError(
                "Không tìm thấy file PDF"
            )

        pages = self.pdf_loader.load(
            source_path
        )

        split_documents = self.text_splitter.split(
            pages
        )

        contents = [
            chunk.page_content
            for chunk in split_documents
        ]

        embeddings = (
            self.embedding_service.embed_documents(
                contents
            )
        )

        if len(embeddings) != len(split_documents):
            raise RuntimeError(
                "Số embedding không khớp số chunk"
            )

        self.chunk_repository.delete_by_document_id(
            db,
            document_id=document.id,
        )

        chunks: list[KnowledgeChunk] = []

        for chunk_index, (
            split_document,
            embedding,
        ) in enumerate(
            zip(
                split_documents,
                embeddings,
                strict=True,
            )
        ):
            page_number = (
                split_document.metadata.get(
                    "page_number"
                )
            )

            chunks.append(
                KnowledgeChunk(
                    document_id=document.id,
                    chunk_index=chunk_index,
                    content=(
                        split_document.page_content
                    ),
                    embedding=embedding,
                    page_number=page_number,
                    extra_metadata=(
                        split_document.metadata
                    ),
                )
            )

        self.chunk_repository.create_many(
            db,
            chunks,
        )

        document.status = DocumentStatus.READY
        document.is_active = True
        document.indexed_at = datetime.now(
            timezone.utc
        )

        job.status = IngestionJobStatus.COMPLETED
        job.completed_at = datetime.now(
            timezone.utc
        )
        job.error_message = None

        db.commit()


def ingest_pdf_background(
    document_id: int,
    job_id: int,
) -> None:
    db = SessionLocal()

    try:
        service = IngestionService()

        service.ingest_pdf(
            db,
            document_id=document_id,
            job_id=job_id,
        )

    except Exception as exc:
        db.rollback()

        document = db.get(
            KnowledgeDocument,
            document_id,
        )
        job = db.get(
            IngestionJob,
            job_id,
        )

        if document is not None:
            document.status = DocumentStatus.FAILED
            document.is_active = False

        if job is not None:
            job.status = IngestionJobStatus.FAILED
            job.error_message = str(exc)
            job.completed_at = datetime.now(
                timezone.utc
            )

        db.commit()

        logger.exception(
            "PDF ingestion failed: document_id=%s, job_id=%s",
            document_id,
            job_id,
        )

    finally:
        db.close()