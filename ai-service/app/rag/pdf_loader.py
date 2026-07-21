from pathlib import Path

from langchain_core.documents import Document
from pypdf import PdfReader


class PDFLoader:
    def load(
        self,
        file_path: Path,
    ) -> list[Document]:
        reader = PdfReader(
            str(file_path)
        )

        documents: list[Document] = []

        for page_index, page in enumerate(
            reader.pages
        ):
            content = (
                page.extract_text() or ""
            ).strip()

            if not content:
                continue

            documents.append(
                Document(
                    page_content=content,
                    metadata={
                        "page_number": page_index + 1,
                    },
                )
            )

        if not documents:
            raise ValueError(
                "Không đọc được nội dung văn bản từ PDF"
            )

        return documents