from fastapi import UploadFile
from pathlib import Path
from sqlalchemy.orm import Session
from app.repositories.knowledge_chunk_repository import KnowledgeChunkRepository
from app.repositories.ingestion_job_repository import IngestionJobRepository
from app.repositories.knowledge_document_repository import KnowledgeDocumentRepository
from app.services.file_storage_service import FileStorageService
from app.models.enums import DocumentStatus, IngestionJobStatus
from app.schemas.document import DocumentUploadResponse, DocumentListItemResponse, DocumentDetailResponse

class DocumentRetryError(RuntimeError):
    pass

class DuplicateDocumentError(RuntimeError):
    pass

class DocumentRestoreError(RuntimeError):
    pass

class DocumentProcessingError(RuntimeError):
    pass

class DocumentNotFoundError(LookupError):
    pass

class DocumentPermanentDeleteError(RuntimeError):
    pass

class DocumentReindexError(RuntimeError):
    pass

class DocumentService:
    def __init__(self) -> None:
        self.file_storage = FileStorageService()
        self.document_repository = KnowledgeDocumentRepository()
        self.job_repository = IngestionJobRepository()
        self.chunk_repository = KnowledgeChunkRepository()

    def upload_pdf(self, db: Session, *, upload: UploadFile, title: str | None) -> DocumentUploadResponse:
        stored_pdf = self.file_storage.save_pdf(upload)

        try:
            existing_document = self.document_repository.get_by_checksum(db, stored_pdf.checksum)

            if existing_document is not None:
                if existing_document.status == DocumentStatus.FAILED:
                    self.document_repository.mark_pending(db, existing_document)
                    job = self.job_repository.create_pdf_job(db, document_id=existing_document.id)
                    db.commit()
                    db.refresh(existing_document)
                    db.refresh(job)
                    stored_pdf.path.unlink(missing_ok=True)
                    return DocumentUploadResponse(document_id=existing_document.id, job_id=job.id, 
                                                  document_status=existing_document.status, job_status=job.status, 
                                                  message="Tài liệu đã được đưa vào hàng đợi để thử lại")

                if existing_document.status == DocumentStatus.ARCHIVED:
                    raise DuplicateDocumentError("Tài liệu đã được lưu trữ, hãy khôi phục tài liệu")

                raise DuplicateDocumentError("Tài liệu đã tồn tại")

            document = self.document_repository.create_pdf(db, title=title or stored_pdf.original_filename, source_uri=str(stored_pdf.path), 
                                                           original_filename=stored_pdf.original_filename, checksum=stored_pdf.checksum)
            job = self.job_repository.create_pdf_job(db, document_id=document.id)

            db.commit()
            db.refresh(document)
            db.refresh(job)
            return DocumentUploadResponse(document_id=document.id, job_id=job.id, 
                                          document_status=document.status, job_status=job.status, 
                                          message="Tài liệu đã được tải lên và đưa vào hàng đợi xử lý")

        except Exception:
            db.rollback()
            stored_pdf.path.unlink(missing_ok=True)
            raise

    def get_documents(self, db: Session) -> list[DocumentListItemResponse]:
        documents = self.document_repository.get_all(db)
        return [DocumentListItemResponse.model_validate(document) for document in documents]

    def get_document_detail(self, db: Session, document_id: int) -> DocumentDetailResponse:
        document = self.document_repository.get_by_id(db, document_id)
        if document is None:
            raise DocumentNotFoundError("Không tìm thấy tài liệu")

        ingestion_jobs = self.job_repository.get_all_by_document_id(db, document_id)
        chunk_count = self.chunk_repository.count_by_document_id(db, document_id)

        return DocumentDetailResponse(
            id=document.id,
            title=document.title,
            description=document.description,
            original_filename=document.original_filename,
            status=document.status,
            is_active=document.is_active,
            created_at=document.created_at,
            updated_at=document.updated_at,
            indexed_at=document.indexed_at,
            chunk_count=chunk_count,
            ingestion_jobs=ingestion_jobs,
        )

    def delete_document(self, db: Session, document_id: int) -> None:
        document = self.document_repository.get_by_id(db, document_id)
        if document is None:
            raise DocumentNotFoundError("Không tìm thấy tài liệu")
        if document.status in {DocumentStatus.PENDING, DocumentStatus.PROCESSING}:
            raise DocumentProcessingError("Không thể xóa tài liệu đang chờ hoặc đang được xử lý")
        try:
            self.document_repository.archive(db, document)
            db.commit()
        except Exception:
            db.rollback()
            raise

    def restore_document(self, db: Session, document_id: int) -> None:
        document = self.document_repository.get_by_id(db, document_id)
        if document is None:
            raise DocumentNotFoundError("Không tìm thấy tài liệu")
        if document.status != DocumentStatus.ARCHIVED:
            raise DocumentRestoreError("Chỉ có thể khôi phục tài liệu đang ở trạng thái archived")
        chunk_count = self.chunk_repository.count_by_document_id(db, document_id)
        if chunk_count == 0:
            raise DocumentRestoreError("Tài liệu không còn chunk, cần reindex trước khi sử dụng")
        try:
            self.document_repository.restore(db, document)
            db.commit()
        except Exception:
            db.rollback()
            raise

    def permanently_delete_document(self, db: Session, document_id: int) -> None:
        document = self.document_repository.get_by_id(db, document_id)
        if document is None:
            raise DocumentNotFoundError("Không tìm thấy tài liệu")
        if document.status != DocumentStatus.ARCHIVED:
            raise DocumentPermanentDeleteError("Chỉ có thể xóa vĩnh viễn tài liệu đang ở trạng thái archived")

        source_uri = document.source_uri
        try:
            self.document_repository.delete_permanently(db, document)
            self.file_storage.delete_pdf(source_uri)
            db.commit()
        except Exception:
            db.rollback()
            raise

    def reindex_document(self, db: Session, document_id: int) -> DocumentUploadResponse:
        document = self.document_repository.get_by_id(db, document_id)
        if document is None:
            raise DocumentNotFoundError("Không tìm thấy tài liệu")
        if document.status in {DocumentStatus.PENDING, DocumentStatus.PROCESSING}:
            raise DocumentReindexError("Tài liệu đang chờ hoặc đang được xử lý")
        if document.status == DocumentStatus.ARCHIVED:
            raise DocumentReindexError("Tài liệu đã được lưu trữ, hãy khôi phục tài liệu trước")
        if not Path(document.source_uri or "").is_file():
            raise DocumentReindexError("Không tìm thấy file PDF gốc để reindex")

        try:
            self.document_repository.mark_pending(db, document)
            job = self.job_repository.create_reindex_job(db, document.id)
            db.commit()
            db.refresh(document)
            db.refresh(job)
            return DocumentUploadResponse(document_id=document.id, job_id=job.id, document_status=document.status, 
                                          job_status=job.status, message="Tài liệu đã được đưa vào hàng đợi để lập chỉ mục lại")
        except Exception:
            db.rollback()
            raise

    def retry_document(self, db: Session, document_id: int) -> DocumentUploadResponse:
        document = self.document_repository.get_by_id(db, document_id)
        if document is None:
            raise DocumentNotFoundError("Không tìm thấy tài liệu")
        if document.status != DocumentStatus.FAILED:
            raise DocumentRetryError("Chỉ có thể retry tài liệu đang ở trạng thái failed")
        if not Path(document.source_uri or "").is_file():
            raise DocumentRetryError("Không tìm thấy file PDF gốc để retry")

        latest_job = self.job_repository.get_latest_by_document_id(db, document_id)
        if latest_job is None:
            raise DocumentRetryError("Không tìm thấy ingestion job để retry")
        if latest_job.status != IngestionJobStatus.FAILED:
            raise DocumentRetryError("Ingestion job gần nhất không ở trạng thái failed")

        try:
            self.document_repository.mark_pending(db, document)
            job = self.job_repository.create_retry_job(db, document.id, latest_job.job_type)
            db.commit()
            db.refresh(document)
            db.refresh(job)
            return DocumentUploadResponse(document_id=document.id, job_id=job.id, document_status=document.status, 
                                          job_status=job.status, message="Tài liệu đã được đưa vào hàng đợi để thử lại")
        except Exception:
            db.rollback()
            raise