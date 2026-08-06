
from sqlalchemy.orm import Session
from app.models.message_source import MessageSource
from app.schemas.retrieval import RetrievedChunkResponse
class MessageSourceRepository:
    def create_many(self, db: Session, *, message_id: int, chunks: list[RetrievedChunkResponse]) -> list[MessageSource]:
        sources = [MessageSource(message_id=message_id, chunk_id=chunk.chunk_id, rank=rank) for rank, chunk in enumerate(chunks, start=1)]

        if sources:
            db.add_all(sources)

        return sources