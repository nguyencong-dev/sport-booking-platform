"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import {
  ImageIcon,
  LoaderCircle,
  MapPin,
  Save,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { venueService } from "@/services/venue.service";

type VenueFormMode = "create" | "edit";

type VenueFormScreenProps = {
  mode: VenueFormMode;
  venueId?: number;
};

type ApiErrorResponse = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

export function VenueFormScreen({
  mode,
  venueId,
}: VenueFormScreenProps) {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [currentBanner, setCurrentBanner] = useState("");
  const [currentLogo, setCurrentLogo] = useState("");
  const [loading, setLoading] = useState(mode === "edit");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const bannerPreview = useMemo(
    () => (banner ? URL.createObjectURL(banner) : currentBanner),
    [banner, currentBanner],
  );
  const logoPreview = useMemo(
    () => (logo ? URL.createObjectURL(logo) : currentLogo),
    [currentLogo, logo],
  );

  useEffect(() => {
    return () => {
      if (banner && bannerPreview) {
        URL.revokeObjectURL(bannerPreview);
      }

      if (logo && logoPreview) {
        URL.revokeObjectURL(logoPreview);
      }
    };
  }, [banner, bannerPreview, logo, logoPreview]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login?redirect=/my-venues");
      return;
    }

    if (user?.role !== "COURT_OWNER") {
      router.replace("/");
    }
  }, [isAuthenticated, ready, router, user]);

  useEffect(() => {
    if (
      mode !== "edit" ||
      !venueId ||
      !ready ||
      user?.role !== "COURT_OWNER"
    ) {
      return;
    }

    const currentVenueId = venueId;
    const currentUserId = user.id;
    let active = true;

    async function loadVenue() {
      try {
        setLoading(true);
        setError("");

        const venue = await venueService.getById(currentVenueId);

        if (!active) {
          return;
        }

        if (venue.ownerId !== currentUserId) {
          router.replace("/my-venues");
          return;
        }

        setName(venue.name);
        setAddress(venue.address);
        setLatitude(
          venue.latitude === null ? "" : String(venue.latitude),
        );
        setLongitude(
          venue.longitude === null ? "" : String(venue.longitude),
        );
        setCurrentBanner(venue.banner ?? "");
        setCurrentLogo(venue.logo ?? "");
      } catch (requestError) {
        if (active) {
          if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
            setError(
              requestError.response?.data?.message ??
                "Không thể tải thông tin sân.",
            );
          } else {
            setError("Không thể tải thông tin sân.");
          }
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadVenue();

    return () => {
      active = false;
    };
  }, [mode, ready, router, user, venueId]);

  function selectImage(
    event: ChangeEvent<HTMLInputElement>,
    setter: (file: File | null) => void,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("File được chọn phải là hình ảnh.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setError("Kích thước mỗi hình ảnh không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setter(file);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedAddress = address.trim();
    const parsedLatitude =
      latitude.trim() === "" ? undefined : Number(latitude);
    const parsedLongitude =
      longitude.trim() === "" ? undefined : Number(longitude);

    if (!normalizedName || !normalizedAddress) {
      setError("Tên sân và địa chỉ không được để trống.");
      return;
    }

    if (
      parsedLatitude !== undefined &&
      (!Number.isFinite(parsedLatitude) ||
        parsedLatitude < -90 ||
        parsedLatitude > 90)
    ) {
      setError("Vĩ độ phải nằm trong khoảng từ -90 đến 90.");
      return;
    }

    if (
      parsedLongitude !== undefined &&
      (!Number.isFinite(parsedLongitude) ||
        parsedLongitude < -180 ||
        parsedLongitude > 180)
    ) {
      setError("Kinh độ phải nằm trong khoảng từ -180 đến 180.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const payload = {
        name: normalizedName,
        address: normalizedAddress,
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        banner,
        logo,
      };

      if (mode === "edit" && venueId) {
        await venueService.update(venueId, payload);
      } else {
        await venueService.create(payload);
      }

      router.push("/my-venues");
      router.refresh();
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        const fieldErrors = requestError.response?.data?.fieldErrors;
        const firstFieldError =
          fieldErrors && Object.values(fieldErrors)[0];

        setError(
          firstFieldError ??
            requestError.response?.data?.message ??
            "Không thể lưu thông tin sân.",
        );
      } else {
        setError("Không thể lưu thông tin sân.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (
    !ready ||
    !user ||
    user.role !== "COURT_OWNER" ||
    loading
  ) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      </main>
    );
  }

  return (
    <main className="flex-1 bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-4xl">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
          {mode === "create" ? "Thêm sân tập" : "Chỉnh sửa sân tập"}
        </h1>

        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader className="px-6 pt-7 sm:px-8">
            <CardTitle className="text-xl font-black text-[#073b77]">
              Thông tin sân
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="venue-name"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Tên sân
                </label>
                <input
                  id="venue-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={150}
                  required
                  disabled={submitting}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10"
                />
              </div>

              <div>
                <label
                  htmlFor="venue-address"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Địa chỉ
                </label>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                  <MapPin className="size-5 shrink-0 text-[#ff174f]" />
                  <input
                    id="venue-address"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    maxLength={255}
                    required
                    disabled={submitting}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="venue-latitude"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Vĩ độ
                  </label>
                  <input
                    id="venue-latitude"
                    type="number"
                    step="any"
                    min={-90}
                    max={90}
                    value={latitude}
                    onChange={(event) => setLatitude(event.target.value)}
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="venue-longitude"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Kinh độ
                  </label>
                  <input
                    id="venue-longitude"
                    type="number"
                    step="any"
                    min={-180}
                    max={180}
                    value={longitude}
                    onChange={(event) => setLongitude(event.target.value)}
                    disabled={submitting}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-[#073b77] focus:ring-2 focus:ring-[#073b77]/10"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <ImageField
                  label="Ảnh bìa"
                  preview={bannerPreview}
                  disabled={submitting}
                  onChange={(event) =>
                    selectImage(event, setBanner)
                  }
                />

                <ImageField
                  label="Logo"
                  preview={logoPreview}
                  disabled={submitting}
                  onChange={(event) => selectImage(event, setLogo)}
                />
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
                >
                  {error}
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  type="button"
                  variant="outline"
                  disabled={submitting}
                  onClick={() => router.push("/my-venues")}
                  className="h-12 rounded-xl font-bold"
                >
                  Hủy
                </Button>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 rounded-xl bg-[#ff174f] font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e]"
                >
                  {submitting ? (
                    <LoaderCircle className="size-5 animate-spin" />
                  ) : (
                    <Save className="size-5" />
                  )}
                  {submitting ? "Đang lưu..." : "Lưu sân"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

type ImageFieldProps = {
  label: string;
  preview: string;
  disabled: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

function ImageField({
  label,
  preview,
  disabled,
  onChange,
}: ImageFieldProps) {
  return (
    <div>
      <span className="mb-2 block text-sm font-bold text-slate-700">
        {label}
      </span>

      <label className="block cursor-pointer overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50">
        <div className="grid aspect-[16/9] place-items-center overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt={label}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-sm font-semibold text-slate-500">
              <ImageIcon className="size-7" />
              Chọn hình ảnh
            </div>
          )}
        </div>

        <input
          type="file"
          accept="image/*"
          disabled={disabled}
          onChange={onChange}
          className="sr-only"
        />
      </label>
    </div>
  );
}
