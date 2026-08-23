from pydantic import BaseModel, Field, ConfigDict, model_validator
from datetime import datetime
from decimal import Decimal
from app.models.enums import MessageRole

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

class ConversationListItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: str
    created_at: datetime
    updated_at: datetime

class ConversationMessageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    role: MessageRole
    content: str
    created_at: datetime

class ChatRequest(BaseModel):
    conversation_id: int | None = Field(default=None, gt=0)
    message: str = Field(min_length=1, max_length=4000)
    latitude: Decimal | None = Field(default=None, ge=-90, le=90)
    longitude: Decimal | None = Field(default=None, ge=-180, le=180)

    @model_validator(mode="after")
    def validate_coordinates(self) -> "ChatRequest":
        if (self.latitude is None) != (self.longitude is None):
            raise ValueError("Vĩ độ và kinh độ phải được truyền cùng nhau")

        return self