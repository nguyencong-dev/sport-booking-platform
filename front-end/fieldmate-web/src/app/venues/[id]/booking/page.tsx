import { BookingScreen } from "@/screens/Booking/BookingScreen";

type BookingPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function BookingPage({
  params,
}: BookingPageProps) {
  const { id } = await params;

  return <BookingScreen venueId={Number(id)} />;
}
