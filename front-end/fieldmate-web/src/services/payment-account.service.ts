import {
  fieldmateClient,
  fieldmateEndpoints,
} from "@/configs/fieldmate-client";
import type {
  MomoPaymentAccountRequest,
  PaymentAccountStatus,
  PaymentAccountResponse,
  VnPayPaymentAccountRequest,
} from "@/types/payment-account";

export const paymentAccountService = {
  async getMyAccounts() {
    const response = await fieldmateClient.get<
      PaymentAccountResponse[]
    >(fieldmateEndpoints.myPaymentAccounts);

    return response.data;
  },

  async getById(accountId: number) {
    const response = await fieldmateClient.get<PaymentAccountResponse>(
      fieldmateEndpoints.paymentAccount(accountId),
    );

    return response.data;
  },

  async createMomo(request: MomoPaymentAccountRequest) {
    const response = await fieldmateClient.post<PaymentAccountResponse>(
      fieldmateEndpoints.momoPaymentAccounts,
      request,
    );

    return response.data;
  },

  async createVnPay(request: VnPayPaymentAccountRequest) {
    const response = await fieldmateClient.post<PaymentAccountResponse>(
      fieldmateEndpoints.vnPayPaymentAccounts,
      request,
    );

    return response.data;
  },

  async updateMomo(
    accountId: number,
    request: MomoPaymentAccountRequest,
  ) {
    const response = await fieldmateClient.put<PaymentAccountResponse>(
      fieldmateEndpoints.momoPaymentAccount(accountId),
      request,
    );

    return response.data;
  },

  async updateVnPay(
    accountId: number,
    request: VnPayPaymentAccountRequest,
  ) {
    const response = await fieldmateClient.put<PaymentAccountResponse>(
      fieldmateEndpoints.vnPayPaymentAccount(accountId),
      request,
    );

    return response.data;
  },

  async activate(accountId: number) {
    const response = await fieldmateClient.patch<PaymentAccountResponse>(
      fieldmateEndpoints.activatePaymentAccount(accountId),
    );

    return response.data;
  },

  async deactivate(accountId: number) {
    const response = await fieldmateClient.patch<PaymentAccountResponse>(
      fieldmateEndpoints.deactivatePaymentAccount(accountId),
    );

    return response.data;
  },

  async getAll(status?: PaymentAccountStatus) {
    const response = await fieldmateClient.get<
      PaymentAccountResponse[]
    >(fieldmateEndpoints.paymentAccounts, {
      params: {
        status,
      },
    });

    return response.data;
  },

  async updateStatus(
    accountId: number,
    status: PaymentAccountStatus,
  ) {
    const response = await fieldmateClient.patch<PaymentAccountResponse>(
      fieldmateEndpoints.paymentAccountStatus(accountId),
      {
        status,
      },
    );

    return response.data;
  },
};
