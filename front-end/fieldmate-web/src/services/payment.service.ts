import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  PaymentRequest,
  PaymentResponse,
} from "@/types/payment";

export const paymentService = {
  async create(
    bookingId: number,
    request: PaymentRequest,
  ): Promise<PaymentResponse> {
    const response =
      await fieldmateClient.post<PaymentResponse>(
        `/secure/bookings/${bookingId}/payments`,
        request,
      );

    return response.data;
  },

  async receiveRemainingCash(
    bookingId: number,
  ): Promise<PaymentResponse> {
    const response = await fieldmateClient.post<PaymentResponse>(
      `/secure/bookings/${bookingId}/cash-payments`,
    );

    return response.data;
  },

  async getByBookingId(
    bookingId: number,
  ): Promise<PaymentResponse[]> {
    const response = await fieldmateClient.get<PaymentResponse[]>(
      `/secure/bookings/${bookingId}/payments`,
    );

    return response.data;
  },

  async getById(paymentId: number): Promise<PaymentResponse> {
    const response = await fieldmateClient.get<PaymentResponse>(
      `/secure/payments/${paymentId}`,
    );

    return response.data;
  },
};
