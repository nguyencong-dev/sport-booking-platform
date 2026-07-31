import { notFound } from "next/navigation";

import { AdminPaymentDetailScreen } from "@/screens/AdminPaymentDetail/AdminPaymentDetailScreen";

type AdminPaymentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminPaymentDetailPage({
  params,
}: AdminPaymentDetailPageProps) {
  const { id } = await params;
  const paymentId = Number(id);

  if (!Number.isInteger(paymentId) || paymentId <= 0) {
    notFound();
  }

  return <AdminPaymentDetailScreen paymentId={paymentId} />;
}
