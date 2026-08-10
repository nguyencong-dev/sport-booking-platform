from sqlalchemy import delete, select, func
from sqlalchemy.orm import Session
from app.models.knowledge_chunk import KnowledgeChunk
from app.models.enums import DocumentStatus
from app.models.knowledge_document import KnowledgeDocument
from app.schemas.retrieval import RetrievedChunkResponse

class KnowledgeChunkRepository:
    def delete_by_document_id(self, db: Session, document_id: int) -> None:
        db.execute(delete(KnowledgeChunk).where(KnowledgeChunk.document_id == document_id))

    def create_many(self, db: Session, chunks: list[KnowledgeChunk]) -> None:
        db.add_all(chunks)

    def search_similar(self, db: Session, *, query_embedding: list[float], top_k: int, similarity_threshold: float) -> list[RetrievedChunkResponse]:
        cosine_distance = KnowledgeChunk.embedding.cosine_distance(query_embedding)
        cosine_similarity = (1 - cosine_distance).label("similarity")

        statement = (
            select(KnowledgeChunk, KnowledgeDocument.title.label("document_title"), cosine_similarity)
            .join(KnowledgeDocument, KnowledgeDocument.id == KnowledgeChunk.document_id)
            .where(KnowledgeDocument.status == DocumentStatus.READY)
            .where(KnowledgeDocument.is_active.is_(True))
            .where(cosine_similarity >= similarity_threshold)
            .order_by(cosine_distance.asc())
            .limit(top_k)
        )

        rows = db.execute(statement).all()

        return [
            RetrievedChunkResponse(
                chunk_id=chunk.id,
                document_id=chunk.document_id,
                document_title=document_title,
                chunk_index=chunk.chunk_index,
                content=chunk.content,
                page_number=chunk.page_number,
                similarity=float(similarity),
                extra_metadata=chunk.extra_metadata,
            )
            for chunk, document_title, similarity in rows
        ]

    def count_by_document_id( self,db: Session,document_id: int) -> int:
        statement = select(func.count(KnowledgeChunk.id)).where(KnowledgeChunk.document_id == document_id)
        return db.scalar(statement) or 0