from datetime import date
from typing import Any

import httpx

from app.core.config import settings
from app.schemas.auth import CurrentUser
from app.schemas.fieldmate import CourtResponse, PageResponse, SportTypeResponse, VenueBookingScheduleResponse, VenueDetailResponse, VenueSummaryResponse

class FieldMateClientError(Exception):
    def __init__(self, status_code: int, detail: str) -> None:
        super().__init__(detail)
        self.status_code = status_code
        self.detail = detail

class FieldMateClient:
    def __init__(self) -> None:
        self.client = httpx.AsyncClient(base_url=settings.fieldmate_api_base_url.rstrip("/"), timeout=settings.fieldmate_api_timeout_seconds)

    async def close(self) -> None:
        await self.client.aclose()

    async def get_sport_types(self) -> list[SportTypeResponse]:
        data = await self._get("/api/sport-types")
        return [SportTypeResponse.model_validate(item) for item in data]

    async def search_venues(self, *, name: str | None = None, address: str | None = None, sport_type_id: int | None = None, status: str | None = "ACTIVE", page: int = 0) -> PageResponse[VenueSummaryResponse]:
        params = {"name": name, "address": address, "sportTypeId": sport_type_id, "status": status, "page": page}
        data = await self._get("/api/venues", params=self._remove_none(params))
        return PageResponse[VenueSummaryResponse].model_validate(data)

    async def get_venue_detail(self, venue_id: int) -> VenueDetailResponse:
        data = await self._get(f"/api/venues/{venue_id}")
        return VenueDetailResponse.model_validate(data)

    async def get_venue_courts(self, venue_id: int) -> list[CourtResponse]:
        data = await self._get(f"/api/venues/{venue_id}/courts")
        return [CourtResponse.model_validate(item) for item in data]

    async def get_court_detail(self, court_id: int) -> CourtResponse:
        data = await self._get(f"/api/courts/{court_id}")
        return CourtResponse.model_validate(data)

    async def get_booking_schedule(self, venue_id: int, booking_date: date) -> VenueBookingScheduleResponse:
        data = await self._get(f"/api/venues/{venue_id}/booking-schedule", params={"date": booking_date.isoformat()})
        return VenueBookingScheduleResponse.model_validate(data)

    async def get_current_user(self, access_token: str) -> CurrentUser:
        data = await self._get("/api/secure/users/me", access_token=access_token)
        return CurrentUser.model_validate(data)

    async def _get(self, path: str, *, params: dict[str, Any] | None = None, access_token: str | None = None) -> Any:
        headers = {"Authorization": f"Bearer {access_token}"} if access_token else None

        try:
            response = await self.client.get(path, params=params, headers=headers)
        except httpx.TimeoutException as exc:
            raise FieldMateClientError(503, "FieldMate backend phản hồi quá thời gian") from exc
        except httpx.RequestError as exc:
            raise FieldMateClientError(503, "Không thể kết nối FieldMate backend") from exc

        if response.status_code == 401:
            raise FieldMateClientError(401, "Access token không hợp lệ hoặc đã hết hạn")

        if response.status_code == 403:
            raise FieldMateClientError(403, "Không có quyền thực hiện yêu cầu")

        if response.status_code == 404:
            raise FieldMateClientError(404, "Không tìm thấy dữ liệu FieldMate")

        if response.is_error:
            raise FieldMateClientError(502, "FieldMate backend trả về lỗi")

        try:
            return response.json()
        except ValueError as exc:
            raise FieldMateClientError(502, "FieldMate backend trả về dữ liệu không hợp lệ") from exc

    @staticmethod
    def _remove_none(params: dict[str, Any]) -> dict[str, Any]:
        return {key: value for key, value in params.items() if value is not None}

fieldmate_client = FieldMateClient()