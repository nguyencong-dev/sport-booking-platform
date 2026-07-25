"use client";

import axios from "axios";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Building2, MapPin, Volleyball } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { sportTypeService } from "@/services/sport-type.service";
import type { SportTypeResponse } from "@/types/sport-type";

export type VenueSearchFilters = {
  name: string;
  sportTypeId?: number;
  address?: string;
};

type VenueSearchProps = {
  searching: boolean;
  onSearch: (filters: VenueSearchFilters) => Promise<void>;
};

type ApiErrorResponse = {
  message?: string;
};

type LocationOption = {
  value: string;
  label: string;
};

const provinces: LocationOption[] = [
  { value: "ho-chi-minh", label: "Thành phố Hồ Chí Minh" },
  { value: "ha-noi", label: "Hà Nội" },
  { value: "da-nang", label: "Đà Nẵng" },
];

const wardsByProvince: Record<string, LocationOption[]> = {
  "ho-chi-minh": [
    { value: "phuong-sai-gon", label: "Phường Sài Gòn" },
    { value: "phuong-ben-thanh", label: "Phường Bến Thành" },
    { value: "phuong-binh-thanh", label: "Phường Bình Thạnh" },
    { value: "phuong-thu-duc", label: "Phường Thủ Đức" },
  ],
  "ha-noi": [
    { value: "phuong-ba-dinh", label: "Phường Ba Đình" },
    { value: "phuong-cau-giay", label: "Phường Cầu Giấy" },
    { value: "phuong-dong-da", label: "Phường Đống Đa" },
    { value: "phuong-nam-tu-liem", label: "Phường Nam Từ Liêm" },
  ],
  "da-nang": [
    { value: "phuong-hai-chau", label: "Phường Hải Châu" },
    { value: "phuong-son-tra", label: "Phường Sơn Trà" },
    { value: "phuong-ngu-hanh-son", label: "Phường Ngũ Hành Sơn" },
  ],
};

export function VenueSearch({
  searching,
  onSearch,
}: VenueSearchProps) {
  const [sportTypeId, setSportTypeId] = useState("");
  const [provinceId, setProvinceId] = useState("");
  const [wardId, setWardId] = useState("");
  const [sportTypes, setSportTypes] = useState<SportTypeResponse[]>([]);
  const [loadingSports, setLoadingSports] = useState(true);
  const [sportError, setSportError] = useState("");

  const wards = useMemo(
    () => wardsByProvince[provinceId] ?? [],
    [provinceId],
  );

  useEffect(() => {
    let active = true;

    async function loadSportTypes() {
      try {
        setLoadingSports(true);
        setSportError("");

        const data = await sportTypeService.getAll();

        if (active) {
          setSportTypes(data);
        }
      } catch (requestError) {
        if (!active) {
          return;
        }

        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setSportError(
            requestError.response?.data?.message ??
            "Không thể tải danh sách môn thể thao.",
          );
        } else {
          setSportError("Không thể tải danh sách môn thể thao.");
        }
      } finally {
        if (active) {
          setLoadingSports(false);
        }
      }
    }

    loadSportTypes();

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const selectedSport = sportTypes.find(
      (sportType) => String(sportType.id) === sportTypeId,
    );
    const selectedProvince = provinces.find(
      (province) => province.value === provinceId,
    );
    const selectedWard = wards.find((ward) => ward.value === wardId);

    await onSearch({
      name: "",
      sportTypeId: selectedSport?.id,
      address: selectedWard?.label ?? selectedProvince?.label,
    });

    document.getElementById("venue-list")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  return (
    <section
      id="venue-search"
      aria-labelledby="venue-search-title"
      className="relative z-20 mx-auto -mt-10 w-[calc(100%-2rem)] max-w-[1600px] rounded-[1.2rem] border border-slate-100 border-t-[#073b77] bg-white px-5 py-5 shadow-[0_12px_32px_rgba(15,23,42,0.12)] sm:-mt-12 sm:w-[85%] sm:px-6 sm:py-6 lg:px-7 lg:py-6"
    >
      <div className="mb-7">
        <h2
          id="venue-search-title"
          className="text-[2rem] font-black leading-tight tracking-[-0.035em] text-[#073b77] sm:text-[2.4rem]"
        >
          Đặt sân thể thao ngay
        </h2>
        <p className="mt-4 text-base text-slate-500 sm:text-xl">
          Tìm kiếm sân chơi thể thao, thi đấu khắp cả nước
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid items-stretch gap-4 lg:grid-cols-4 lg:gap-5"
      >
        <Select
          value={sportTypeId}
          onValueChange={(value) => setSportTypeId(value ?? "")}
          disabled={loadingSports || Boolean(sportError)}
        >
          <SelectTrigger className="h-[50px] min-h-[50px] w-full items-center justify-start gap-3 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm focus:ring-2 focus:ring-slate-400 focus:ring-offset-0 sm:text-base">
            <Volleyball className="size-5 shrink-0 text-slate-700" />
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-slate-200" />
            <div className="flex-1 truncate text-left">
              <SelectValue
                placeholder={
                  loadingSports
                    ? "Đang tải môn thể thao..."
                    : sportError || "Chọn môn thể thao"
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent align="start">
            {sportTypes.map((sportType) => (
              <SelectItem key={sportType.id} value={String(sportType.name)}>
                {sportType.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={provinceId}
          onValueChange={(value) => {
            setProvinceId(value ?? "");
            setWardId("");
          }}
        >
          <SelectTrigger className="h-[50px] min-h-[50px] w-full items-center justify-start gap-3 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm focus:ring-2 focus:ring-slate-400 focus:ring-offset-0 sm:text-base">
            <Building2 className="size-5 shrink-0 text-slate-700" />
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-slate-200" />
            <div className="flex-1 truncate text-left">
              <SelectValue placeholder="Chọn tỉnh/thành phố" />
            </div>
          </SelectTrigger>
          <SelectContent align="start">
            {provinces.map((province) => (
              <SelectItem key={province.value} value={province.value}>
                {province.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={wardId}
          onValueChange={(value) => setWardId(value ?? "")}
          disabled={!provinceId}
        >
          <SelectTrigger className="h-[50px] min-h-[50px] w-full items-center justify-start gap-3 rounded-xl border-slate-200 bg-white px-4 text-sm shadow-sm focus:ring-2 focus:ring-slate-400 focus:ring-offset-0 sm:text-base">
            <MapPin className="size-5 shrink-0 text-slate-700" />
            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-slate-200" />
            <div className="flex-1 truncate text-left">
              <SelectValue
                placeholder={
                  provinceId
                    ? "Chọn phường/xã"
                    : "Chọn tỉnh/thành phố trước"
                }
              />
            </div>
          </SelectTrigger>
          <SelectContent align="start">
            {wards.map((ward) => (
              <SelectItem key={ward.value} value={ward.value}>
                {ward.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="submit"
          disabled={searching}
          className="h-[50px] min-h-[50px] w-full rounded-xl bg-[#ff174f] px-6 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e] sm:text-base"
        >
          {searching ? "Đang tìm..." : "Tìm kiếm ngay"}
        </Button>
      </form>

      {sportError && (
        <p className="mt-3 text-sm text-destructive">{sportError}</p>
      )}
    </section>
  );
}
