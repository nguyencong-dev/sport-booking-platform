import { fieldmateClient } from "@/services/clients/fieldmate-client";
import type {
  MomoPaymentAccountRequest,
  PaymentAccountResponse,
  VnPayPaymentAccountRequest,
} from "@/types/payment-account";

export const paymentAccountService = {
  async getMyAccounts() {
    const response = await fieldmateClient.get<
      PaymentAccountResponse[]
    >("/secure/payment-accounts/me");

    return response.data;
  },

  async getById(accountId: number) {
    const response = await fieldmateClient.get<PaymentAccountResponse>(
      `/secure/payment-accounts/${accountId}`,
    );

    return response.data;
  },

  async createMomo(request: MomoPaymentAccountRequest) {
    const response = await fieldmateClient.post<PaymentAccountResponse>(
      "/secure/payment-accounts/momo",
      request,
    );

    return response.data;
  },

  async createVnPay(request: VnPayPaymentAccountRequest) {
    const response = await fieldmateClient.post<PaymentAccountResponse>(
      "/secure/payment-accounts/vnpay",
      request,
    );

    return response.data;
  },

  async updateMomo(
    accountId: number,
    request: MomoPaymentAccountRequest,
  ) {
    const response = await fieldmateClient.put<PaymentAccountResponse>(
      `/secure/payment-accounts/${accountId}/momo`,
      request,
    );

    return response.data;
  },

  async updateVnPay(
    accountId: number,
    request: VnPayPaymentAccountRequest,
  ) {
    const response = await fieldmateClient.put<PaymentAccountResponse>(
      `/secure/payment-accounts/${accountId}/vnpay`,
      request,
    );

    return response.data;
  },

  async activate(accountId: number) {
    const response = await fieldmateClient.patch<PaymentAccountResponse>(
      `/secure/payment-accounts/${accountId}/active`,
    );

    return response.data;
  },

  async deactivate(accountId: number) {
    const response = await fieldmateClient.patch<PaymentAccountResponse>(
      `/secure/payment-accounts/${accountId}/inactive`,
    );

    return response.data;
  },
};
