import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
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
        fieldmateEndpoints.bookingPayments(bookingId),
        request,
      );

    return response.data;
  },

  async receiveRemainingCash(
    bookingId: number,
  ): Promise<PaymentResponse> {
    const response = await fieldmateClient.post<PaymentResponse>(
      fieldmateEndpoints.bookingCashPayments(bookingId),
    );

    return response.data;
  },

  async getByBookingId(
    bookingId: number,
  ): Promise<PaymentResponse[]> {
    const response = await fieldmateClient.get<PaymentResponse[]>(
      fieldmateEndpoints.bookingPayments(bookingId),
    );

    return response.data;
  },

  async getById(paymentId: number): Promise<PaymentResponse> {
    const response = await fieldmateClient.get<PaymentResponse>(
      fieldmateEndpoints.payment(paymentId),
    );

    return response.data;
  },
};
