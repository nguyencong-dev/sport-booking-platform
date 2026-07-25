"use client";

import { VenueCard } from "@/components/VenueCard/VenueCard";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import type { VenueSummaryResponse } from "@/types/venue";

type VenueListProps = {
  venues: VenueSummaryResponse[];
};

export function VenueList({ venues }: VenueListProps) {
  if (venues.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed bg-white px-6 py-16 text-center">
        <h2 className="font-semibold text-[#073b77]">Chưa có sân nào</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Hiện chưa có thông tin sân phù hợp để hiển thị.
        </p>
      </div>
    );
  }

  return (
    <Carousel
      opts={{ align: "start" }}
      className="w-full"
      aria-label="Danh sách sân thể thao"
    >
      <CarouselContent className="-ml-4 py-2">
        {venues.map((venue) => (
          <CarouselItem
            key={venue.id}
            className="basis-[88%] pl-4 sm:basis-1/2 lg:basis-1/3 xl:basis-1/4"
          >
            <VenueCard venue={venue} />
          </CarouselItem>
        ))}
      </CarouselContent>

      <div className="mt-5 flex justify-end gap-2">
        <CarouselPrevious className="static size-11 translate-y-0 border-slate-200 bg-white text-[#073b77] hover:border-[#ff174f] hover:bg-rose-50 hover:text-[#ff174f]" />
        <CarouselNext className="static size-11 translate-y-0 border-slate-200 bg-white text-[#073b77] hover:border-[#ff174f] hover:bg-rose-50 hover:text-[#ff174f]" />
      </div>
    </Carousel>
  );
}
