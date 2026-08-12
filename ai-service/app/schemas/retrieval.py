from typing import Any
from pydantic import BaseModel, Field

class RetrievedChunkResponse(BaseModel):
    chunk_id: int
    document_id: int
    document_title: str
    chunk_index: int
    content: str
    page_number: int | None
    similarity: float
    extra_metadata: dict[str, Any]

class RagQueryPlan(BaseModel):
    in_scope: bool
    search_query: str = ""

class RagRerankSelection(BaseModel):
    selected_chunk_ids: list[int] = Field(default_factory=list)