import { BookingDetailScreen } from "@/screens/BookingDetail/BookingDetailScreen";

type BookingDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function getFirstSearchParam(
  value: string | string[] | undefined,
) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingDetailPage({
  params,
  searchParams,
}: BookingDetailPageProps) {
  const [{ id }, query] = await Promise.all([
    params,
    searchParams,
  ]);
  const bookingId = Number(id);
  const paymentId = Number(
    getFirstSearchParam(query.paymentId),
  );
  const gatewayParam = getFirstSearchParam(query.gateway);
  const gateway: "momo" | "vnpay" | null =
    gatewayParam === "momo" || gatewayParam === "vnpay"
      ? gatewayParam
      : null;
  const paymentReturn =
    gateway && Number.isInteger(paymentId) && paymentId > 0
      ? {
          gateway,
          paymentId,
        }
      : null;

  return (
    <BookingDetailScreen
      bookingId={bookingId}
      paymentReturn={paymentReturn}
    />
  );
}
