export type PaymentProvider = "MOMO" | "VNPAY";

export type PaymentAccountStatus =
  | "PENDING"
  | "ACTIVE"
  | "INACTIVE"
  | "SUSPENDED";

export type PaymentAccountResponse = {
  id: number;
  provider: PaymentProvider;
  status: PaymentAccountStatus;
  partnerCode?: string;
  tmnCode?: string;
  createdAt: string;
  updatedAt: string;
};

export type MomoPaymentAccountRequest = {
  partnerCode: string;
  accessKey: string;
  secretKey: string;
};

export type VnPayPaymentAccountRequest = {
  tmnCode: string;
  hashSecret: string;
};
