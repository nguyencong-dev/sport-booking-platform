import hashlib
import uuid
from dataclasses import dataclass
from pathlib import Path

from fastapi import UploadFile

from app.core.config import settings


class PDFUploadError(Exception):
    status_code = 400


class UnsupportedPDFError(PDFUploadError):
    status_code = 415


class PDFTooLargeError(PDFUploadError):
    status_code = 413


@dataclass(frozen=True)
class StoredPDF:
    path: Path
    original_filename: str
    checksum: str
    size: int


class FileStorageService:
    READ_SIZE = 1024 * 1024

    def save_pdf(
        self,
        upload: UploadFile,
    ) -> StoredPDF:
        original_filename = Path(
            upload.filename or ""
        ).name

        if not original_filename:
            raise PDFUploadError(
                "Tên file không hợp lệ"
            )

        if Path(original_filename).suffix.lower() != ".pdf":
            raise UnsupportedPDFError(
                "Chỉ chấp nhận file PDF"
            )

        if upload.content_type != "application/pdf":
            raise UnsupportedPDFError(
                "Content-Type phải là application/pdf"
            )

        storage_dir = (
            settings.document_storage_dir.resolve()
        )
        storage_dir.mkdir(
            parents=True,
            exist_ok=True,
        )

        stored_filename = f"{uuid.uuid4().hex}.pdf"
        destination = storage_dir / stored_filename

        max_size = settings.max_pdf_size_mb * 1024 * 1024
        total_size = 0
        checksum = hashlib.sha256()
        header = bytearray()

        try:
            with destination.open("wb") as output:
                while chunk := upload.file.read(
                    self.READ_SIZE
                ):
                    total_size += len(chunk)

                    if total_size > max_size:
                        raise PDFTooLargeError(
                            "File PDF vượt quá kích thước cho phép"
                        )

                    if len(header) < 1024:
                        remaining = 1024 - len(header)
                        header.extend(chunk[:remaining])

                    checksum.update(chunk)
                    output.write(chunk)

            if total_size == 0:
                raise PDFUploadError(
                    "File PDF rỗng"
                )

            if b"%PDF-" not in header:
                raise UnsupportedPDFError(
                    "Nội dung file không phải PDF hợp lệ"
                )

            return StoredPDF(
                path=destination,
                original_filename=original_filename,
                checksum=checksum.hexdigest(),
                size=total_size,
            )

        except Exception:
            destination.unlink(
                missing_ok=True,
            )
            raise