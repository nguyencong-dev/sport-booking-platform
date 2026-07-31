import { Suspense } from "react";

import { PaymentAccountFormScreen } from "@/screens/PaymentAccountForm/PaymentAccountFormScreen";

export default function CreatePaymentAccountPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex-1 bg-slate-100" />
      }
    >
      <PaymentAccountFormScreen mode="create" />
    </Suspense>
  );
}
