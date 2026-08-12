from sqlalchemy.orm import Session

from app.core.config import settings
from app.repositories.knowledge_chunk_repository import KnowledgeChunkRepository
from app.schemas.retrieval import RetrievedChunkResponse
from app.services.embedding_service import EmbeddingService

class RetrievalQueryError(ValueError):
    pass

class RetrievalService:
    def __init__(self, embedding_service: EmbeddingService | None = None, chunk_repository: KnowledgeChunkRepository | None = None) -> None:
        self.embedding_service = embedding_service or EmbeddingService()
        self.chunk_repository = chunk_repository or KnowledgeChunkRepository()

    def search(self, db: Session, *, query: str, top_k: int | None = None, 
               similarity_threshold: float | None = None) -> list[RetrievedChunkResponse]:
        cleaned_query = " ".join(query.split())

        if not cleaned_query:
            raise RetrievalQueryError("Câu hỏi tìm kiếm không được để trống")

        resolved_top_k = top_k if top_k is not None else settings.rag_top_k
        resolved_similarity_threshold = similarity_threshold if similarity_threshold is not None else settings.rag_similarity_threshold

        if resolved_top_k <= 0:
            raise RetrievalQueryError("top_k phải lớn hơn 0")

        if not 0 <= resolved_similarity_threshold <= 1:
            raise RetrievalQueryError("similarity_threshold phải nằm trong khoảng từ 0 đến 1")

        query_embedding = self.embedding_service.embed_query(cleaned_query)

        if len(query_embedding) != settings.openai_embedding_dimensions:
            raise RuntimeError("Số chiều query embedding không khớp cấu hình")

        return self.chunk_repository.search_similar(db, query_embedding=query_embedding, 
                                                    top_k=resolved_top_k, similarity_threshold=resolved_similarity_threshold)

retrieval_service = RetrievalService()