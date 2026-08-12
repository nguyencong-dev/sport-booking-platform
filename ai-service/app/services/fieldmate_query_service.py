import asyncio
import unicodedata
from datetime import date

from app.clients import FieldMateClient, fieldmate_client
from app.schemas.fieldmate import (CourtResponse, PageResponse, SportTypeResponse, 
VenueBookingScheduleResponse, VenueInformationResponse, VenueSummaryResponse)


class FieldMateQueryError(ValueError):
    pass

class FieldMateQueryService:
    def __init__(self, client: FieldMateClient) -> None:
        self.client = client

    async def get_sport_types(self) -> list[SportTypeResponse]:
        return await self.client.get_sport_types()
    
    async def find_sport_type(self, name: str) -> SportTypeResponse:
        normalized_name = self._normalize_text(name)

        if not normalized_name:
            raise FieldMateQueryError("Tên môn thể thao không được để trống")

        sport_types = await self.client.get_sport_types()
        exact_matches = [sport_type for sport_type in sport_types if self._normalize_text(sport_type.name) == normalized_name]

        if exact_matches:
            return exact_matches[0]

        partial_matches = [sport_type for sport_type in sport_types if normalized_name in self._normalize_text(sport_type.name) 
                           or self._normalize_text(sport_type.name) in normalized_name]

        if len(partial_matches) == 1:
            return partial_matches[0]

        if not partial_matches:
            available_names = ", ".join(sport_type.name for sport_type in sport_types)
            raise FieldMateQueryError(f"Không tìm thấy môn thể thao '{name}'. Các môn hiện có: {available_names}")

        matched_names = ", ".join(sport_type.name for sport_type in partial_matches)
        raise FieldMateQueryError(f"Tên môn thể thao '{name}' chưa rõ ràng. Các kết quả phù hợp: {matched_names}")

    async def search_venues(self, *, name: str | None = None, address: str | None = None, 
                            sport_type_name: str | None = None, page: int = 0) -> PageResponse[VenueSummaryResponse]:
        if page < 0:
            raise FieldMateQueryError("Số trang không được nhỏ hơn 0")

        cleaned_name = self._clean_optional_text(name)
        cleaned_address = self._clean_optional_text(address)
        cleaned_sport_type_name = self._clean_optional_text(sport_type_name)
        sport_type_id: int | None = None

        if cleaned_sport_type_name is not None:
            sport_type = await self.find_sport_type(cleaned_sport_type_name)
            sport_type_id = sport_type.id

        return await self.client.search_venues(name=cleaned_name, address=cleaned_address, 
                                               sport_type_id=sport_type_id, status="ACTIVE", page=page)

    async def get_venue_information(self, venue_id: int) -> VenueInformationResponse:
        self._validate_positive_id(venue_id, "venue_id")
        venue, courts = await asyncio.gather(self.client.get_venue_detail(venue_id), self.client.get_venue_courts(venue_id))
        return VenueInformationResponse(venue=venue, courts=courts)

    async def get_venue_courts(self, venue_id: int) -> list[CourtResponse]:
        self._validate_positive_id(venue_id, "venue_id")
        return await self.client.get_venue_courts(venue_id)

    async def get_court_information(self, court_id: int) -> CourtResponse:
        self._validate_positive_id(court_id, "court_id")
        return await self.client.get_court_detail(court_id)

    async def get_venue_schedule(self, venue_id: int, booking_date: date) -> VenueBookingScheduleResponse:
        self._validate_positive_id(venue_id, "venue_id")
        return await self.client.get_booking_schedule(venue_id, booking_date)

    @staticmethod
    def _validate_positive_id(value: int, field_name: str) -> None:
        if value <= 0:
            raise FieldMateQueryError(f"{field_name} phải lớn hơn 0")

    @staticmethod
    def _clean_optional_text(value: str | None) -> str | None:
        if value is None:
            return None

        cleaned_value = " ".join(value.split())
        return cleaned_value or None

    @staticmethod
    def _normalize_text(value: str) -> str:
        normalized_value = unicodedata.normalize("NFD", value.strip().casefold())
        normalized_value = "".join(character for character in normalized_value if unicodedata.category(character) != "Mn")
        normalized_value = normalized_value.replace("đ", "d")
        return " ".join(normalized_value.split())

fieldmate_query_service = FieldMateQueryService(fieldmate_client)