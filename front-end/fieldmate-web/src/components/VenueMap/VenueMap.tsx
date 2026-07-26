"use client";

import dynamic from "next/dynamic";
import { LoaderCircle, MapPin } from "lucide-react";

type VenueMapProps = {
  venueName: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

const VenueMapClient = dynamic(
  () =>
    import("./VenueMapClient").then(
      (module) => module.VenueMapClient,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[380px] items-center justify-center rounded-3xl bg-slate-100">
        <div className="flex items-center gap-3 font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-[#ff174f]" />
          Đang tải bản đồ...
        </div>
      </div>
    ),
  },
);

export function VenueMap({
  venueName,
  address,
  latitude,
  longitude,
}: VenueMapProps) {
  if (latitude === null || longitude === null) {
    return (
      <div className="flex h-[380px] flex-col items-center justify-center rounded-3xl bg-slate-100 text-center">
        <MapPin className="size-10 text-slate-400" />

        <p className="mt-3 font-bold text-slate-500">
          Sân chưa có thông tin vị trí
        </p>
      </div>
    );
  }

  return (
    <VenueMapClient
      venueName={venueName}
      address={address}
      latitude={Number(latitude)}
      longitude={Number(longitude)}
    />
  );
}
