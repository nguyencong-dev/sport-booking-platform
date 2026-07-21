from sqlalchemy.orm import Session

from app.models.enums import (
    DocumentStatus,
    SourceType,
)
from app.models.knowledge_document import (
    KnowledgeDocument,
)


class KnowledgeDocumentRepository:
    def create_pdf(
        self,
        db: Session,
        *,
        title: str,
        source_uri: str,
        original_filename: str,
        checksum: str,
    ) -> KnowledgeDocument:
        document = KnowledgeDocument(
            title=title,
            source_type=SourceType.PDF,
            source_entity_type=None,
            source_entity_id=None,
            source_uri=source_uri,
            original_filename=original_filename,
            checksum=checksum,
            status=DocumentStatus.PENDING,
            is_active=False,
            extra_metadata={},
        )

        db.add(document)
        db.flush()

        return document

    def get_by_id(
        self,
        db: Session,
        document_id: int,
    ) -> KnowledgeDocument | None:
        return db.get(
            KnowledgeDocument,
            document_id,
        )