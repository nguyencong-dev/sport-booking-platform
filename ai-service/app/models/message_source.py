from datetime import datetime

from sqlalchemy import (
    DateTime,
    ForeignKey,
    Identity,
    Integer,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class MessageSource(Base):
    __tablename__ = "message_sources"

    id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
    )

    message_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "ai.messages.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    chunk_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "ai.knowledge_chunks.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    rank: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )