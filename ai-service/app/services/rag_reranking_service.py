import json

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from app.core.config import settings
from app.schemas.retrieval import (
    RagRerankSelection,
    RetrievedChunkResponse,
)

from app.prompts.rag_prompt import RERANK_SYSTEM_PROMPT


class RagRerankingService:
    def __init__(self, model: ChatOpenAI | None = None) -> None:
        base_model = model or ChatOpenAI(
            api_key=settings.openai_api_key.get_secret_value(),
            model=settings.openai_chat_model,
            temperature=0,
        )

        self.model = base_model.with_structured_output(
            RagRerankSelection
        )

    async def rerank(
        self,
        *,
        query: str,
        chunks: list[RetrievedChunkResponse],
        limit: int | None = None,
    ) -> list[RetrievedChunkResponse]:
        if not chunks:
            return []

        resolved_limit = limit or settings.rag_final_top_k

        candidates = [
            {
                "chunk_id": chunk.chunk_id,
                "document_title": chunk.document_title,
                "page_number": chunk.page_number,
                "similarity": chunk.similarity,
                "content": chunk.content,
            }
            for chunk in chunks
        ]

        human_prompt = (
            f"Truy vấn:\n{query}\n\n"
            f"Chọn tối đa {resolved_limit} chunk phù hợp nhất.\n\n"
            f"Các chunk ứng viên:\n"
            f"{json.dumps(candidates, ensure_ascii=False)}"
        )

        selection = await self.model.ainvoke(
            [
                SystemMessage(content=RERANK_SYSTEM_PROMPT),
                HumanMessage(content=human_prompt),
            ]
        )

        chunks_by_id = {
            chunk.chunk_id: chunk
            for chunk in chunks
        }

        selected_chunks: list[RetrievedChunkResponse] = []
        seen_ids: set[int] = set()

        for chunk_id in selection.selected_chunk_ids:
            if chunk_id in seen_ids:
                continue

            chunk = chunks_by_id.get(chunk_id)

            if chunk is None:
                continue

            selected_chunks.append(chunk)
            seen_ids.add(chunk_id)

            if len(selected_chunks) >= resolved_limit:
                break

        return selected_chunks

rag_reranking_service = RagRerankingService()