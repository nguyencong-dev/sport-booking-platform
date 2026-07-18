from enum import Enum


class SourceType(str, Enum):
    PDF = "pdf"
    DATABASE = "database"


class SourceEntityType(str, Enum):
    SPORT = "sport"
    EXERCISE = "exercise"
    TRAINING_PLAN = "training_plan"
    CLUB = "club"
    TOURNAMENT = "tournament"


class DocumentStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    READY = "ready"
    FAILED = "failed"
    ARCHIVED = "archived"

class IngestionJobType(str, Enum):
    PDF_INGESTION = "pdf_ingestion"
    DATABASE_INGESTION = "database_ingestion"
    DOCUMENT_REINDEX = "document_reindex"


class IngestionJobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"