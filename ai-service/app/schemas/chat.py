from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    conversation_id: int | None = Field(default=None, gt = 0)
    message: str = Field(min_length=1, max_length=4000)

class ChatSourceResponse(BaseModel):
    chunk_id: int
    document_id: int
    document_title: str
    page_number: int | None
    similarity: float

class ChatResponse(BaseModel):
    conversation_id: int
    user_message_id: int
    assistant_message_id: int
    answer: str
    sources: list[ChatSourceResponse]