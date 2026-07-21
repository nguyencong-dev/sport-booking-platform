from langchain_openai import OpenAIEmbeddings

from app.core.config import settings


class EmbeddingService:
    def __init__(self) -> None:
        self.client = OpenAIEmbeddings(
            api_key=(
                settings.openai_api_key
                .get_secret_value()
            ),
            model=settings.openai_embedding_model,
            dimensions=(
                settings.openai_embedding_dimensions
            ),
        )

    def embed_documents(
        self,
        contents: list[str],
    ) -> list[list[float]]:
        if not contents:
            return []

        return self.client.embed_documents(
            contents
        )