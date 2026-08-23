"use client";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "react-leaflet";
import { ExternalLink, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";

type VenueMapClientProps = {
  venueName: string;
  address: string;
  latitude: number;
  longitude: number;
};

export function VenueMapClient({
  venueName,
  address,
  latitude,
  longitude,
}: VenueMapClientProps) {
  const position: [number, number] = [
    latitude,
    longitude,
  ];

  const googleMapsUrl =
    `https://www.google.com/maps/search/?api=1` +
    `&query=${latitude},${longitude}`;

  function openGoogleMaps() {
    window.open(
      googleMapsUrl,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <h2 className="text-xl font-black text-[#073b77]">
            Vị trí sân
          </h2>

          <div className="mt-2 flex items-start gap-2 text-sm text-slate-500">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff174f]" />
            <span>{address}</span>
          </div>
        </div>

        <Button
          nativeButton={false}
          variant="outline"
          render={
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
            />
          }
          className="shrink-0 rounded-xl border-[#073b77]/20 font-bold text-[#073b77] hover:bg-blue-50 hover:text-[#073b77]"
        >
          <ExternalLink className="size-4" />
          Mở Google Maps
        </Button>
      </div>

      <MapContainer
        center={position}
        zoom={17}
        zoomAnimation={false}
        scrollWheelZoom
        className="h-[380px] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <CircleMarker
          center={position}
          radius={12}
          pathOptions={{
            color: "#ffffff",
            weight: 4,
            fillColor: "#ff174f",
            fillOpacity: 1,
          }}
          eventHandlers={{
            click: openGoogleMaps,
          }}
        >
          <Popup>
            <div className="min-w-48">
              <p className="font-bold text-[#073b77]">
                {venueName}
              </p>

              <p className="mt-1 text-sm text-slate-500">
                {address}
              </p>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-block font-bold text-[#ff174f]"
              >
                Mở Google Maps
              </a>
            </div>
          </Popup>
        </CircleMarker>
      </MapContainer>
    </div>
  );
}
