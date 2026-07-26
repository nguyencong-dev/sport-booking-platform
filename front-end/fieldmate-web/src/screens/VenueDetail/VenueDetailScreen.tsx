"use client";

import axios from "axios";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  CalendarCheck,
  Check,
  CircleAlert,
  CircleCheck,
  CircleX,
  Clock3,
  ImageOff,
  MapPin,
  ShieldCheck,
  UserRound,
  Volleyball,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { VenueMap } from "@/components/VenueMap/VenueMap";
import { courtService } from "@/services/court.service";
import { venueService } from "@/services/venue.service";
import type { CourtResponse, CourtStatus } from "@/types/court";
import type {
  VenueDetailResponse,
  VenueStatus,
} from "@/types/venue";

type VenueDetailScreenProps = {
  venueId: number;
};

type ApiErrorResponse = {
  message?: string;
};

type StatusPresentation = {
  label: string;
  className: string;
  icon: LucideIcon;
};

const venueStatus: Record<VenueStatus, StatusPresentation> = {
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

const courtStatus: Record<CourtStatus, StatusPresentation> = {
  ACTIVE: {
    label: "Sẵn sàng",
    className: "bg-emerald-50 text-emerald-700",
    icon: CircleCheck,
  },
  INACTIVE: {
    label: "Tạm ngưng",
    className: "bg-slate-100 text-slate-600",
    icon: CircleX,
  },
  MAINTENANCE: {
    label: "Bảo trì",
    className: "bg-amber-50 text-amber-700",
    icon: Wrench,
  },
};

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function DetailSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
      <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
      <Skeleton className="h-[480px] w-full rounded-3xl" />
    </div>
  );
}

export function VenueDetailScreen({
  venueId,
}: VenueDetailScreenProps) {
  const [venue, setVenue] = useState<VenueDetailResponse | null>(null);
  const [courts, setCourts] = useState<CourtResponse[]>([]);
  const [selectedImage, setSelectedImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const gallery = useMemo(() => {
    if (!venue) {
      return [];
    }

    return Array.from(
      new Set([venue.banner, ...(venue.images ?? [])].filter(Boolean)),
    ) as string[];
  }, [venue]);

  useEffect(() => {
    let active = true;

    async function loadVenueDetail() {
      if (!Number.isInteger(venueId) || venueId <= 0) {
        setError("Mã sân không hợp lệ.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [venueData, courtData] = await Promise.all([
          venueService.getById(venueId),
          courtService.getByVenueId(venueId),
        ]);

        if (active) {
          setVenue(venueData);
          setCourts(courtData);
          setSelectedImage(
            venueData.banner ?? venueData.images?.[0] ?? "",
          );
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải thông tin sân.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải thông tin sân.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadVenueDetail();

    return () => {
      active = false;
    };
  }, [venueId]);

  const currentVenueStatus = venue
    ? venueStatus[venue.status]
    : null;

  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        {loading ? (
          <DetailSkeleton />
        ) : error || !venue || !currentVenueStatus ? (
          <Alert variant="destructive" className="mx-auto max-w-2xl p-5">
            <CircleAlert />
            <AlertTitle>Không thể hiển thị sân</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <>
            <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
              <div>
                <Card className="gap-0 overflow-hidden rounded-3xl border-slate-100 bg-white py-0 shadow-sm">
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    {selectedImage ? (
                      <img
                        src={selectedImage}
                        alt={`Hình ảnh ${venue.name}`}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-slate-400">
                        <div className="text-center">
                          <ImageOff className="mx-auto size-10" />
                          <p className="mt-2 text-sm">Sân chưa có hình ảnh</p>
                        </div>
                      </div>
                    )}

                    <Badge
                      className={`absolute left-4 top-4 border-0 ${currentVenueStatus.className}`}
                    >
                      <currentVenueStatus.icon />
                      {currentVenueStatus.label}
                    </Badge>
                  </div>
                </Card>

                {gallery.length > 1 && (
                  <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-6">
                    {gallery.map((image) => (
                      <button
                        key={image}
                        type="button"
                        onClick={() => setSelectedImage(image)}
                        aria-label={`Xem hình ảnh của ${venue.name}`}
                        className={`aspect-[4/3] overflow-hidden rounded-xl border-2 bg-white transition ${
                          selectedImage === image
                            ? "border-[#ff174f]"
                            : "border-transparent opacity-75 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Card className="gap-0 rounded-3xl border-slate-100 bg-white py-0 shadow-sm lg:sticky lg:top-24">
                <CardHeader className="p-6">
                  <div className="flex items-start gap-4">
                    {venue.logo ? (
                      <img
                        src={venue.logo}
                        alt={`Logo ${venue.name}`}
                        className="size-16 rounded-2xl border bg-white object-cover"
                      />
                    ) : (
                      <div className="grid size-16 shrink-0 place-items-center rounded-2xl bg-blue-50 text-2xl font-black text-[#073b77]">
                        {venue.name.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0">
                      <CardTitle className="text-2xl font-black leading-tight text-[#073b77]">
                        {venue.name}
                      </CardTitle>
                      <div className="mt-3 flex items-start gap-2 text-sm leading-6 text-slate-500">
                        <MapPin className="mt-1 size-4 shrink-0 text-[#ff174f]" />
                        <span>{venue.address}</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="border-t border-slate-100 p-6">
                  <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-4">
                    <UserRound className="size-5 text-[#073b77]" />
                    <div>
                      <p className="text-xs text-slate-400">Chủ sân</p>
                      <p className="mt-1 text-sm font-bold text-[#073b77]">
                        {venue.ownerName}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {venue.status === "ACTIVE" ? (
                      <Button
                        nativeButton={false}
                        size="lg"
                        render={
                          <Link href={`/venues/${venue.id}/booking`} />
                        }
                        className="h-12 w-full rounded-xl bg-[#ff174f] font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e]"
                      >
                        <CalendarCheck />
                        Đặt sân ngay
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        disabled
                        className="h-12 w-full rounded-xl"
                      >
                        Hiện chưa thể đặt sân
                      </Button>
                    )}

                    <Button
                      nativeButton={false}
                      variant="outline"
                      size="lg"
                      render={<Link href="/" />}
                      className="h-12 w-full rounded-xl border-[#073b77]/20 font-bold text-[#073b77] hover:bg-blue-50 hover:text-[#073b77]"
                    >
                      Tiếp tục xem sân khác
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </section>

            <section className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(300px,0.6fr)]">
              <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-black text-[#073b77]">
                    <Volleyball className="size-5 text-[#ff174f]" />
                    Danh sách sân và mức giá
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courts.length === 0 ? (
                    <p className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-500">
                      Venue chưa có sân con để hiển thị.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {courts.map((court) => {
                        const presentation = courtStatus[court.status];
                        const CourtStatusIcon = presentation.icon;

                        return (
                          <div
                            key={court.id}
                            className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-extrabold text-[#073b77]">
                                  {court.name}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className={`border-0 ${presentation.className}`}
                                >
                                  <CourtStatusIcon />
                                  {presentation.label}
                                </Badge>
                              </div>
                              <p className="mt-2 text-sm text-slate-500">
                                {court.sportTypeName}
                              </p>
                            </div>

                            <div className="sm:text-right">
                              <p className="text-lg font-black text-[#ff174f]">
                                {currencyFormatter.format(court.pricePerHour)}
                              </p>
                              <p className="text-xs text-slate-400">mỗi giờ</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-black text-[#073b77]">
                      <CircleCheck className="size-5 text-emerald-500" />
                      Tiện ích
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(venue.benefits ?? []).length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có thông tin tiện ích.
                      </p>
                    ) : (
                      <ul className="space-y-3">
                        {venue.benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="flex items-start gap-2 text-sm text-slate-600"
                          >
                            <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                  </CardContent>
                </Card>

                <Card className="rounded-3xl border-slate-100 bg-white shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg font-black text-[#073b77]">
                      <ShieldCheck className="size-5 text-[#ff174f]" />
                      Quy định
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {(venue.rules ?? []).length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có thông tin quy định.
                      </p>
                    ) : (
                      <ol className="space-y-3">
                        {venue.rules.map((rule, index) => (
                          <li
                            key={`${index}-${rule}`}
                            className="flex items-start gap-3 text-sm text-slate-600"
                          >
                            <span className="grid size-5 shrink-0 place-items-center rounded-full bg-rose-50 text-xs font-bold text-[#ff174f]">
                              {index + 1}
                            </span>
                            {rule}
                          </li>
                        ))}
                      </ol>
                    )}
                  </CardContent>
                </Card>
              </div>
            </section>

            <section className="mt-8 w-full">
              <VenueMap
                venueName={venue.name}
                address={venue.address}
                latitude={venue.latitude}
                longitude={venue.longitude}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
