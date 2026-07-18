from datetime import datetime

from sqlalchemy import (
    DateTime,
    Enum as SqlEnum,
    ForeignKey,
    Identity,
    Integer,
    Text,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.models.enums import (
    IngestionJobStatus,
    IngestionJobType,
)


class IngestionJob(Base):
    __tablename__ = "ingestion_jobs"

    id: Mapped[int] = mapped_column(
        Integer,
        Identity(),
        primary_key=True,
    )

    document_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey(
            "ai.knowledge_documents.id",
            ondelete="CASCADE",
        ),
        nullable=False,
    )

    job_type: Mapped[IngestionJobType] = mapped_column(
        SqlEnum(
            IngestionJobType,
            name="ingestion_job_type_enum",
            schema="ai",
            values_callable=lambda enum_class: [
                item.value for item in enum_class
            ],
        ),
        nullable=False,
    )

    status: Mapped[IngestionJobStatus] = mapped_column(
        SqlEnum(
            IngestionJobStatus,
            name="ingestion_job_status_enum",
            schema="ai",
            values_callable=lambda enum_class: [
                item.value for item in enum_class
            ],
        ),
        nullable=False,
        default=IngestionJobStatus.PENDING,
        server_default=IngestionJobStatus.PENDING.value,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )