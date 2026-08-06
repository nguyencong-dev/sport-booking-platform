from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.message import Message, MessageRole

class MessageRepository:
    def create(self, db: Session, *, conversation_id: int, role: MessageRole, content: str) -> Message:
        message = Message(conversation_id=conversation_id, role=role, content=content)
        db.add(message)
        db.flush()
        return message

    def get_recent_by_conversation_id(self, db: Session, *, conversation_id: int, limit: int = 10) -> list[Message]:
        statement = select(Message).where(Message.conversation_id == conversation_id).order_by(Message.created_at.desc()).limit(limit)
        messages = list(db.scalars(statement).all())
        messages.reverse()
        return messages