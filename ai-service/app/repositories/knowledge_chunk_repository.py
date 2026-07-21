from sqlalchemy import delete
from sqlalchemy.orm import Session

from app.models.knowledge_chunk import KnowledgeChunk


class KnowledgeChunkRepository:
    def delete_by_document_id(
        self,
        db: Session,
        document_id: int,
    ) -> None:
        db.execute(
            delete(KnowledgeChunk).where(
                KnowledgeChunk.document_id
                == document_id
            )
        )

    def create_many(
        self,
        db: Session,
        chunks: list[KnowledgeChunk],
    ) -> None:
        db.add_all(chunks)