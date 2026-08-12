from typing import Annotated
from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    Path,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import require_admin
from app.schemas.auth import CurrentUser
from app.schemas.document import DocumentUploadResponse, DocumentListItemResponse, DocumentDetailResponse
from app.services.document_service import (DocumentService, DocumentNotFoundError, DuplicateDocumentError, DocumentReindexError,
                                           DocumentProcessingError, DocumentRestoreError, DocumentPermanentDeleteError, DocumentRetryError)
from app.services.file_storage_service import PDFUploadError
from app.services.ingestion_service import ingest_pdf_background


router = APIRouter(prefix="/api/admin/documents", tags=["Admin Documents"])


@router.post("/upload", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED,
)
def upload_document(
    background_tasks: BackgroundTasks,
    file: Annotated[UploadFile, File(description="PDF document")],
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[CurrentUser, Depends(require_admin)],
    title: Annotated[str | None, Form(max_length=255)] = None,
) -> DocumentUploadResponse:
    del admin
    service = DocumentService()
    try:
        document, job = service.upload_pdf(db, upload=file, title=title)
    except PDFUploadError as exc:
        raise HTTPException(status_code=exc.status_code, detail=str(exc)) from exc
    except DuplicateDocumentError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    background_tasks.add_task(ingest_pdf_background, document.id, job.id)

    return DocumentUploadResponse(
        document_id=document.id,
        job_id=job.id,
        document_status=document.status,
        job_status=job.status,
        message=("Document uploaded and queued for ingestion"),
    )

@router.get("",response_model=list[DocumentListItemResponse],status_code=status.HTTP_200_OK,)
def get_documents(
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[CurrentUser, Depends(require_admin)],
) -> list[DocumentListItemResponse]:
    del admin
    service = DocumentService()
    return service.get_documents(db)

@router.get("/{id}", response_model=DocumentDetailResponse,status_code=status.HTTP_200_OK)
def get_document(id: Annotated[int, Path(gt=0)],
    db: Annotated[Session, Depends(get_db)],
    admin: Annotated[CurrentUser, Depends(require_admin)],
) -> DocumentDetailResponse:
    del admin
    service = DocumentService()
    try:
        document, ingestion_jobs, chunk_count = service.get_document_detail(db, id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

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
        ingestion_jobs=ingestion_jobs
    )

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(id: Annotated[int, Path(gt=0)], db: Annotated[Session, Depends(get_db)], 
                    admin: Annotated[CurrentUser, Depends(require_admin)]) -> None:
    del admin
    service = DocumentService()
    try:
        service.delete_document(db, id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DocumentProcessingError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

@router.post("/{id}/restore", status_code=status.HTTP_204_NO_CONTENT)
def restore_document(id: Annotated[int, Path(gt=0)], db: Annotated[Session, Depends(get_db)], 
                     admin: Annotated[CurrentUser, Depends(require_admin)]) -> None:
    del admin
    service = DocumentService()
    try:
        service.restore_document(db, id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DocumentRestoreError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

@router.delete("/{id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
def permanently_delete_document(id: Annotated[int, Path(gt=0)], db: Annotated[Session, Depends(get_db)], 
                                admin: Annotated[CurrentUser, Depends(require_admin)]) -> None:
    del admin
    service = DocumentService()
    try:
        service.permanently_delete_document(db, id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DocumentPermanentDeleteError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    
@router.post("/{id}/reindex", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
def reindex_document(id: Annotated[int, Path(gt=0)], background_tasks: BackgroundTasks, db: Annotated[Session, Depends(get_db)], 
                     admin: Annotated[CurrentUser, Depends(require_admin)]) -> DocumentUploadResponse:
    del admin
    service = DocumentService()
    try:
        document, job = service.reindex_document(db, id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DocumentReindexError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    background_tasks.add_task(ingest_pdf_background, document.id, job.id)

    return DocumentUploadResponse(document_id=document.id, job_id=job.id, document_status=document.status, 
                                  job_status=job.status, message="Document queued for reindexing")

@router.post("/{id}/retry", response_model=DocumentUploadResponse, status_code=status.HTTP_202_ACCEPTED)
def retry_document(id: Annotated[int, Path(gt=0)], background_tasks: BackgroundTasks, db: Annotated[Session, Depends(get_db)], admin: Annotated[CurrentUser, Depends(require_admin)]) -> DocumentUploadResponse:
    del admin
    service = DocumentService()
    try:
        document, job = service.retry_document(db, id)
    except DocumentNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except DocumentRetryError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc

    background_tasks.add_task(ingest_pdf_background, document.id, job.id)

    return DocumentUploadResponse(document_id=document.id, job_id=job.id, document_status=document.status, job_status=job.status, message="Document queued for retry")