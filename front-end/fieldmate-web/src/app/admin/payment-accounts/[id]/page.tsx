import { notFound } from "next/navigation";

import { AdminPaymentAccountDetailScreen } from "@/screens/AdminPaymentAccountDetail/AdminPaymentAccountDetailScreen";

type AdminPaymentAccountDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminPaymentAccountDetailPage({
  params,
}: AdminPaymentAccountDetailPageProps) {
  const { id } = await params;
  const accountId = Number(id);

  if (!Number.isInteger(accountId) || accountId <= 0) {
    notFound();
  }

  return (
    <AdminPaymentAccountDetailScreen accountId={accountId} />
  );
}
