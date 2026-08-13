from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.conversation import Conversation
from app.models.enums import MessageRole
from app.models.message import Message
from datetime import datetime, timezone

class ConversationRepository:
    def create(self, db: Session, *, user_subject: str) -> Conversation:
        conversation = Conversation(user_subject=user_subject)
        db.add(conversation)
        db.flush()
        return conversation

    def get_by_id_and_user_subject(self, db: Session, *, conversation_id: int, user_subject: str) -> Conversation | None:
        statement = select(Conversation).where(Conversation.id == conversation_id, Conversation.user_subject == user_subject)
        return db.scalar(statement)

    def touch(self, conversation: Conversation) -> None:
        conversation.updated_at = datetime.now(timezone.utc)

    def get_all_by_user_subject(self, db: Session, user_subject: str) -> list[tuple[Conversation, str | None]]:
        first_user_message = (
            select(Message.content)
            .where(
                Message.conversation_id == Conversation.id,
                Message.role == MessageRole.USER,
            )
            .order_by(Message.created_at.asc(), Message.id.asc())
            .limit(1)
            .correlate(Conversation)
            .scalar_subquery()
        )
        statement = (
            select(Conversation, first_user_message)
            .where(Conversation.user_subject == user_subject)
            .order_by(Conversation.updated_at.desc(), Conversation.id.desc())
        )
        return [
            (conversation, title)
            for conversation, title in db.execute(statement).all()
        ]

    def delete(self, db: Session, conversation: Conversation) -> None:
        db.delete(conversation)
        db.flush()
