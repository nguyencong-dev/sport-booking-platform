from langchain_core.documents import Document
from langchain_text_splitters import (
    RecursiveCharacterTextSplitter,
)

from app.core.config import settings


class DocumentTextSplitter:
    def __init__(self) -> None:
        self.splitter = (
            RecursiveCharacterTextSplitter(
                chunk_size=settings.rag_chunk_size,
                chunk_overlap=(
                    settings.rag_chunk_overlap
                ),
            )
        )

    def split(
        self,
        documents: list[Document],
    ) -> list[Document]:
        chunks = self.splitter.split_documents(
            documents
        )

        if not chunks:
            raise ValueError(
                "Không tạo được chunk từ PDF"
            )

        return chunks