export type PaymentMethod = "VNPAY" | "MOMO" | "CASH";

export type PaymentType =
  | "DEPOSIT"
  | "REMAINING"
  | "FULL_PAYMENT";

export type PaymentStatus =
  | "PENDING"
  | "PAID"
  | "FAILED"
  | "EXPIRED";

export type PaymentRequest = {
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
};

export type PaymentResponse = {
  id: number;
  bookingId: number;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentType: PaymentType;
  status: PaymentStatus;
  transactionCode: string;
  checkoutUrl: string | null;
  deeplink: string | null;
  qrCodeUrl: string | null;
  paidAt: string | null;
  createdAt: string;
};
