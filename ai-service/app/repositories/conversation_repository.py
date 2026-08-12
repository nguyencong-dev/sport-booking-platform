from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.conversation import Conversation
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

    def get_all_by_user_subject(self, db: Session, user_subject: str) -> list[Conversation]:
        statement = (select(Conversation).where(Conversation.user_subject == user_subject)
                    .order_by(Conversation.updated_at.desc(), Conversation.id.desc()))
        return list(db.scalars(statement).all())

    def delete(self, db: Session, conversation: Conversation) -> None:
        db.delete(conversation)
        db.flush()