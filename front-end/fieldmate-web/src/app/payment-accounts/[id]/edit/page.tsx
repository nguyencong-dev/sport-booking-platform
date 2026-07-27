import { notFound } from "next/navigation";

import { PaymentAccountFormScreen } from "@/screens/PaymentAccountForm/PaymentAccountFormScreen";

type EditPaymentAccountPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPaymentAccountPage({
  params,
}: EditPaymentAccountPageProps) {
  const { id } = await params;
  const accountId = Number(id);

  if (!Number.isInteger(accountId) || accountId <= 0) {
    notFound();
  }

  return (
    <PaymentAccountFormScreen
      mode="edit"
      accountId={accountId}
    />
  );
}
