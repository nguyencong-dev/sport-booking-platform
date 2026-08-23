from datetime import date, datetime, time
from decimal import Decimal
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict
from pydantic.alias_generators import to_camel


class FieldMateSchema(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True)

class SportTypeResponse(FieldMateSchema):
    id: int
    name: str

class BenefitResponse(FieldMateSchema):
    id: int
    name: str

class RuleResponse(FieldMateSchema):
    id: int
    name: str

class VenueImageResponse(FieldMateSchema):
    id: int
    url: str

class VenueSummaryResponse(FieldMateSchema):
    id: int
    name: str
    address: str
    latitude: Decimal | None
    longitude: Decimal | None
    banner: str | None
    logo: str | None
    status: str
    distance_km: Decimal | None = None

class VenueDetailResponse(VenueSummaryResponse):
    owner_id: int | None
    owner_name: str | None
    benefits: list[BenefitResponse]
    rules: list[RuleResponse]
    images: list[VenueImageResponse]
    created_at: datetime
    updated_at: datetime | None

class CourtResponse(FieldMateSchema):
    id: int
    name: str
    price_per_hour: Decimal
    status: str
    sport_type_name: str | None
    venue_name: str | None
    created_at: datetime
    updated_at: datetime | None

class BookedPeriodResponse(FieldMateSchema):
    booking_id: int
    start_time: time
    end_time: time

class CourtBookingScheduleResponse(FieldMateSchema):
    court_id: int
    court_name: str
    booked_periods: list[BookedPeriodResponse]


class VenueBookingScheduleResponse(FieldMateSchema):
    venue_id: int
    date: date
    courts: list[CourtBookingScheduleResponse]

class VenueInformationResponse(FieldMateSchema):
    venue: VenueDetailResponse
    courts: list[CourtResponse]

T = TypeVar("T")

class PageResponse(FieldMateSchema, Generic[T]):
    content: list[T]
    total_elements: int
    total_pages: int
    size: int
    number: int
    number_of_elements: int
    first: bool
    last: bool
    empty: bool