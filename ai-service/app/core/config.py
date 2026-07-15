from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field, SecretStr, model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Application
    app_name: str = "FieldMate AI Service"
    app_env: Literal["local", "test", "staging", "production"] = "local"
    app_host: str = "127.0.0.1"
    app_port: int = Field(default=8000, ge=1, le=65535)
    log_level: str = "INFO"

    # PostgreSQL
    database_url: SecretStr
    database_schema: str = "ai"

    # FieldMate backend
    fieldmate_api_base_url: str = "http://localhost:8080"
    fieldmate_api_timeout_seconds: int = Field(default=10, gt=0)
    fieldmate_internal_api_key: SecretStr | None = None

    # OpenAI
    openai_api_key: SecretStr
    openai_chat_model: str
    openai_embedding_model: str
    openai_embedding_dimensions: int = Field(gt=0)

    # RAG
    rag_chunk_size: int = Field(default=800, gt=0)
    rag_chunk_overlap: int = Field(default=120, ge=0)
    rag_top_k: int = Field(default=6, gt=0)
    rag_similarity_threshold: float = Field(
        default=0.65,
        ge=0.0,
        le=1.0,
    )

    # Documents
    document_storage_dir: Path = Path("./data/documents")
    max_pdf_size_mb: int = Field(default=20, gt=0)

    # LangSmith
    langsmith_tracing: bool = False
    langsmith_api_key: SecretStr | None = None
    langsmith_project: str = "fieldmate-ai"

    @model_validator(mode="after")
    def validate_rag_settings(self) -> "Settings":
        if self.rag_chunk_overlap >= self.rag_chunk_size:
            raise ValueError(
                "RAG_CHUNK_OVERLAP phải nhỏ hơn RAG_CHUNK_SIZE"
            )
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()