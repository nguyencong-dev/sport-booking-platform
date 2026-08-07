from app.core.config import settings
from app.services.rag_query_planner import  RagQueryPlanner, rag_query_planner
from app.services.rag_reranking_service import RagRerankingService, rag_reranking_service
import json
from pydantic import BaseModel, Field
from datetime import date
from langchain_core.tools import BaseTool, tool
from app.core.database import SessionLocal
from app.services.fieldmate_query_service import FieldMateQueryService, fieldmate_query_service
from app.services.retrieval_service import RetrievalService, retrieval_service
from app.schemas.retrieval import RetrievedChunkResponse
class SearchPdfKnowledgeInput(BaseModel):
    query: str = Field(min_length=1)

class SearchVenuesInput(BaseModel):
    name: str | None = Field(default=None)
    address: str | None = Field(default=None)
    sport_type_name: str | None = Field(default=None)
    page: int = Field(default=0, ge=0)

class GetVenueInformationInput(BaseModel):
    venue_id: int = Field(gt=0)

class GetCourtInformationInput(BaseModel):
    court_id: int = Field(gt=0)

class GetVenueScheduleInput(BaseModel):
    venue_id: int = Field(gt=0)
    booking_date: date = Field()

class ChatToolFactory:
    def __init__(self, retrieval: RetrievalService | None = None, fieldmate_query: FieldMateQueryService | None = None,
        query_planner: RagQueryPlanner | None = None, reranker: RagRerankingService | None = None,) -> None:
        self.retrieval = retrieval or retrieval_service
        self.fieldmate_query = (
            fieldmate_query or fieldmate_query_service
        )
        self.query_planner = query_planner or rag_query_planner
        self.reranker = reranker or rag_reranking_service

        self._used_chunks: dict[int, RetrievedChunkResponse] = {}

    @property
    def used_chunks(self) -> list[RetrievedChunkResponse]:
        return list(self._used_chunks.values())

    def build(self) -> list[BaseTool]:
        @tool(args_schema=SearchPdfKnowledgeInput)
        async def search_pdf_knowledge(query: str) -> str:
            """
            Tìm kiến thức thể thao trong PDF.

            Chỉ sử dụng cho câu hỏi về thể thao, hoạt động thể lực,
            chế độ tập luyện, kỹ thuật, luật chơi và an toàn vận động.
            """

            query_plan = await self.query_planner.plan(query)

            if not query_plan.in_scope:
                return json.dumps(
                    {
                        "message": (
                            "Câu hỏi nằm ngoài phạm vi kho tài liệu "
                            "thể thao FieldMate."
                        ),
                        "search_query": "",
                        "chunks": [],
                    },
                    ensure_ascii=False,
                )

            db = SessionLocal()

            try:
                candidate_chunks = self.retrieval.search(
                    db,
                    query=query_plan.search_query,
                    top_k=settings.rag_top_k,
                    similarity_threshold=(settings.rag_similarity_threshold),
                )
            finally:
                db.close()

            selected_chunks = await self.reranker.rerank(
                query=query_plan.search_query,
                chunks=candidate_chunks,
                limit=settings.rag_final_top_k,
            )

            for chunk in selected_chunks:
                self._used_chunks[chunk.chunk_id] = chunk

            if not selected_chunks:
                return json.dumps(
                    {
                        "message": (
                            "Không tìm thấy nội dung đủ liên quan "
                            "trong kho tài liệu."
                        ),
                        "search_query": query_plan.search_query,
                        "chunks": [],
                    },
                    ensure_ascii=False,
                )

            return json.dumps(
                {
                    "message": "Đã tìm thấy nội dung liên quan.",
                    "search_query": query_plan.search_query,
                    "chunks": [
                        chunk.model_dump(mode="json")
                        for chunk in selected_chunks
                    ],
                },
                ensure_ascii=False,
            )

        @tool
        async def get_sport_types() -> str:
            """Lấy danh sách môn thể thao hiện có."""
            sport_types = await self.fieldmate_query.get_sport_types()
            return json.dumps([sport_type.model_dump(mode="json") for sport_type in sport_types], ensure_ascii=False)

        @tool(args_schema=SearchVenuesInput)
        async def search_venues(name: str | None = None, address: str | None = None, sport_type_name: str | None = None, page: int = 0) -> str:
            """Tìm sân theo tên, địa chỉ hoặc môn thể thao."""
            result = await self.fieldmate_query.search_venues(name=name, address=address, sport_type_name=sport_type_name, page=page)
            return json.dumps(result.model_dump(mode="json"), ensure_ascii=False)

        @tool(args_schema=GetVenueInformationInput)
        async def get_venue_information(venue_id: int) -> str:
            """Lấy thông tin chi tiết của một địa điểm cùng danh sách sân con theo ID."""
            result = await self.fieldmate_query.get_venue_information(venue_id)
            return json.dumps(result.model_dump(mode="json"), ensure_ascii=False)

        @tool(args_schema=GetCourtInformationInput)
        async def get_court_information(court_id: int) -> str:
            """Lấy thông tin chi tiết của sân con theo ID."""
            result = await self.fieldmate_query.get_court_information(court_id)
            return json.dumps(result.model_dump(mode="json"), ensure_ascii=False)

        @tool(args_schema=GetVenueScheduleInput)
        async def get_venue_schedule(venue_id: int, booking_date: date) -> str:
            """Lấy lịch đã đặt của sân trong một ngày."""
            result = await self.fieldmate_query.get_venue_schedule(venue_id, booking_date)
            return json.dumps(result.model_dump(mode="json"), ensure_ascii=False)

        return [search_pdf_knowledge, get_sport_types, search_venues, get_venue_information, get_court_information, get_venue_schedule]