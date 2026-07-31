import { notFound } from "next/navigation";

import { AdminBookingDetailScreen } from "@/screens/AdminBookingDetail/AdminBookingDetailScreen";

type AdminBookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminBookingDetailPage({
  params,
}: AdminBookingDetailPageProps) {
  const { id } = await params;
  const bookingId = Number(id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    notFound();
  }

  return <AdminBookingDetailScreen bookingId={bookingId} />;
}
