import Link from "next/link";
import {
  ArrowRight,
  CalendarCheck,
  CircleCheck,
  CircleX,
  Clock3,
  MapPin,
  Navigation,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type {
  VenueStatus,
  VenueSummaryResponse,
} from "@/types/venue";

type VenueCardProps = {
  venue: VenueSummaryResponse;
};

const statusConfig: Record<
  VenueStatus,
  {
    label: string;
    className: string;
    icon: LucideIcon;
  }
> = {
  ACTIVE: {
    label: "Đang hoạt động",
    className: "bg-emerald-500 text-white",
    icon: CircleCheck,
  },
  INACTIVE: {
    label: "Tạm ngưng",
    className: "bg-slate-500 text-white",
    icon: CircleX,
  },
  PENDING: {
    label: "Chờ duyệt",
    className: "bg-amber-500 text-white",
    icon: Clock3,
  },
  REJECTED: {
    label: "Bị từ chối",
    className: "bg-red-500 text-white",
    icon: CircleX,
  },
};

export function VenueCard({ venue }: VenueCardProps) {
  const status = statusConfig[venue.status];
  const StatusIcon = status.icon;

  return (
    <Card className="group h-full gap-0 overflow-hidden rounded-2xl border-slate-100 bg-white py-0 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {venue.banner ? (
          <img
            src={venue.banner}
            alt={`Ảnh sân ${venue.name}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 via-slate-50 to-white">
            <span className="text-sm font-medium text-[#073b77]">
              Chưa có ảnh sân
            </span>
          </div>
        )}

        <Badge
          variant="secondary"
          className={`absolute left-3 top-3 border-0 shadow-sm ${status.className}`}
        >
          <StatusIcon data-icon="inline-start" />
          {status.label}
        </Badge>
      </div>

      <CardHeader className="px-4 pt-4">
        <div className="grid grid-cols-[auto_1fr] items-start gap-3">
          {venue.logo ? (
            <img
              src={venue.logo}
              alt={`Logo ${venue.name}`}
              loading="lazy"
              className="size-11 rounded-xl border bg-white object-cover"
            />
          ) : (
            <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-base font-black text-[#073b77]">
              {venue.name.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="min-w-0">
            <CardTitle className="line-clamp-1 text-base font-extrabold text-[#073b77]">
              {venue.name}
            </CardTitle>
            <div className="mt-1.5 flex items-start gap-1.5 text-sm text-slate-500">
              <MapPin className="mt-0.5 size-4 shrink-0 text-[#ff174f]" />
              <span className="line-clamp-2">{venue.address}</span>
            </div>
            {venue.distanceKm !== null && (
              <div className="mt-2 flex items-center gap-1.5 text-xs font-bold text-[#073b77]">
                <Navigation className="size-3.5 text-[#ff174f]" />
                Cách bạn {venue.distanceKm.toFixed(1)} km
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardFooter className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-4">
        <Button
          nativeButton={false}
          variant="outline"
          render={<Link href={`/venues/${venue.id}`} />}
          className="h-10 w-full rounded-xl border-[#073b77]/20 bg-white px-3 text-xs font-bold text-[#073b77] hover:border-[#073b77] hover:bg-blue-50 hover:text-[#073b77]"
        >
          Chi tiết
          <ArrowRight className="size-3.5" />
        </Button>

        {venue.status === "ACTIVE" ? (
          <Button
            nativeButton={false}
            render={<Link href={`/venues/${venue.id}/booking`} />}
            className="h-10 w-full rounded-xl bg-[#ff174f] px-3 text-xs font-bold text-white shadow-sm shadow-rose-500/20 hover:bg-[#e8003e]"
          >
            <CalendarCheck className="size-3.5" />
            Đặt sân ngay
          </Button>
        ) : (
          <Button
            type="button"
            disabled
            className="h-10 w-full rounded-xl px-3 text-xs font-bold"
          >
            <CalendarCheck className="size-3.5" />
            Không thể đặt
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
