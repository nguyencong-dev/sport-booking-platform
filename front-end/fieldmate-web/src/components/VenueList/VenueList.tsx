import { VenueCard } from "@/components/VenueCard/VenueCard";
import type { VenueSummaryResponse } from "@/types/venue";

type VenueListProps = {
  venues: VenueSummaryResponse[];
};

export function VenueList({ venues }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <p className="py-10 text-center font-semibold text-slate-500">
        Không có sân ở nơi này
      </p>
    );
  }

  return (
    <div
      className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      aria-label="Danh sách sân thể thao"
    >
      {venues.map((venue) => (
        <VenueCard key={venue.id} venue={venue} />
      ))}
    </div>
  );
}
