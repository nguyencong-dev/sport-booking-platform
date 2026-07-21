from typing import Annotated

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    File,
    Form,
    HTTPException,
    UploadFile,
    status,
)
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_admin
from app.schemas.auth import CurrentUser
from app.schemas.document import (
    DocumentUploadResponse,
)
from app.services.document_service import (
    DocumentService,
)
from app.services.file_storage_service import (
    PDFUploadError,
)
from app.services.ingestion_service import (
    ingest_pdf_background,
)


router = APIRouter(
    prefix="/api/admin/documents",
    tags=["Admin Documents"],
)


@router.post(
    "/upload",
    response_model=DocumentUploadResponse,
    status_code=status.HTTP_202_ACCEPTED,
)
def upload_document(
    background_tasks: BackgroundTasks,
    file: Annotated[
        UploadFile,
        File(description="PDF document"),
    ],
    db: Annotated[
        Session,
        Depends(get_db),
    ],
    admin: Annotated[
        CurrentUser,
        Depends(require_admin),
    ],
    title: Annotated[
        str | None,
        Form(max_length=255),
    ] = None,
) -> DocumentUploadResponse:
    del admin

    service = DocumentService()

    try:
        document, job = service.upload_pdf(
            db,
            upload=file,
            title=title,
        )
    except PDFUploadError as exc:
        raise HTTPException(
            status_code=exc.status_code,
            detail=str(exc),
        ) from exc

    background_tasks.add_task(
        ingest_pdf_background,
        document.id,
        job.id,
    )

    return DocumentUploadResponse(
        document_id=document.id,
        job_id=job.id,
        document_status=document.status,
        job_status=job.status,
        message=(
            "Document uploaded and queued for ingestion"
        ),
    )