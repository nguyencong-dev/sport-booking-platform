import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  BookingRequest,
  BookingResponse,
} from "@/types/booking";

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
};
