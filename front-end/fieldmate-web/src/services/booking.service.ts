import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
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

type GetAdminBookingsParams = {
  search?: string;
  status?: BookingStatus;
  page?: number;
};

export const bookingService = {
  async create(request: BookingRequest): Promise<BookingResponse> {
    const response = await fieldmateClient.post<BookingResponse>(
      fieldmateEndpoints.secureBookings,
      request,
    );

    return response.data;
  },

  async getMyBookings(): Promise<BookingResponse[]> {
    const response = await fieldmateClient.get<BookingResponse[]>(
      fieldmateEndpoints.myBookings,
    );

    return response.data;
  },

  async getById(bookingId: number): Promise<BookingResponse> {
    const response = await fieldmateClient.get<BookingResponse>(
      fieldmateEndpoints.secureBooking(bookingId),
    );

    return response.data;
  },

  async getByVenueId(
    venueId: number,
    params: GetVenueBookingsParams = {},
  ): Promise<PageResponse<BookingResponse>> {
    const response = await fieldmateClient.get<
      PageResponse<BookingResponse>
    >(fieldmateEndpoints.secureVenueBookings(venueId), {
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
      fieldmateEndpoints.completeBooking(bookingId),
    );

    return response.data;
  },

  async getAll(
    params: GetAdminBookingsParams = {},
  ): Promise<PageResponse<BookingResponse>> {
    const response = await fieldmateClient.get<
      PageResponse<BookingResponse>
    >(fieldmateEndpoints.secureBookings, {
      params: {
        search: params.search?.trim() || undefined,
        status: params.status,
        page: params.page ?? 0,
      },
    });

    return response.data;
  },
};
