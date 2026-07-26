import { BookingDetailScreen } from "@/screens/BookingDetail/BookingDetailScreen";

type BookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingDetailPage({
  params,
}: BookingDetailPageProps) {
  const { id } = await params;

  return <BookingDetailScreen bookingId={Number(id)} />;
}
