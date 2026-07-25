import { VenueDetailScreen } from "@/screens/VenueDetail/VenueDetailScreen";

type VenueDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function VenueDetailPage({
  params,
}: VenueDetailPageProps) {
  const { id } = await params;

  return <VenueDetailScreen venueId={Number(id)} />;
}
