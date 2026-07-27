import { VenueFormScreen } from "@/screens/VenueForm/VenueFormScreen";
import { notFound } from "next/navigation";

type EditVenuePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditVenuePage({
  params,
}: EditVenuePageProps) {
  const { id } = await params;
  const venueId = Number(id);

  if (!Number.isInteger(venueId) || venueId <= 0) {
    notFound();
  }

  return (
    <VenueFormScreen
      mode="edit"
      venueId={venueId}
    />
  );
}
