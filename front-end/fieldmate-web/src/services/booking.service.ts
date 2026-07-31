import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  BookingRequest,
  BookingResponse,
  BookingStatus,
} from "@/types/booking";
import type { PageResponse } from "@/types/pagination";

type GetVenueBookingsParams = {
  page?: number;
  date?: string;
  status?: BookingStatus;
  bookingId?: number;
};

export const bookingService = {
  async create(request: BookingRequest): Promise<BookingResponse> {
    const response = await fieldmateClient.post<BookingResponse>(
      "/secure/bookings",
      request,
    );

    return response.data;
  },

  async getMyBookings(): Promise<BookingResponse[]> {
    const response = await fieldmateClient.get<BookingResponse[]>(
      "/secure/bookings/me",
    );

    return response.data;
  },

  async getById(bookingId: number): Promise<BookingResponse> {
    const response = await fieldmateClient.get<BookingResponse>(
      `/secure/bookings/${bookingId}`,
    );

    return response.data;
  },

  async getByVenueId(
    venueId: number,
    params: GetVenueBookingsParams = {},
  ): Promise<PageResponse<BookingResponse>> {
    const response = await fieldmateClient.get<
      PageResponse<BookingResponse>
    >(`/secure/venues/${venueId}/bookings`, {
      params: {
        page: params.page ?? 0,
        date: params.date || undefined,
        status: params.status,
        bookingId: params.bookingId,
      },
    });

    return response.data;
  },

  async complete(bookingId: number): Promise<BookingResponse> {
    const response = await fieldmateClient.patch<BookingResponse>(
      `/secure/bookings/${bookingId}/complete`,
    );

    return response.data;
  },

  async getAll(): Promise<BookingResponse[]> {
    const response = await fieldmateClient.get<BookingResponse[]>(
      "/secure/bookings",
    );

    return response.data;
  },
};
