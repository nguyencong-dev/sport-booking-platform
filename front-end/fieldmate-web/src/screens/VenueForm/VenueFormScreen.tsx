"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import {
  CirclePlus,
  ImageIcon,
  LoaderCircle,
  MapPin,
  Save,
  Trash2,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useRef,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { benefitService } from "@/services/benefit.service";
import { courtService } from "@/services/court.service";
import { provinceService } from "@/services/province.service";
import { ruleService } from "@/services/rule.service";
import { sportTypeService } from "@/services/sport-type.service";
import { venueImageService } from "@/services/venue-image.service";
import { venueService } from "@/services/venue.service";
import type { ProvinceResponse } from "@/types/province";
import type { SportTypeResponse } from "@/types/sport-type";

type VenueFormMode = "create" | "edit";

type VenueFormScreenProps = {
  mode: VenueFormMode;
  venueId?: number;
};

type ApiErrorResponse = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

type CourtFormItem = {
  clientId: string;
  id?: number;
  name: string;
  pricePerHour: string;
  sportTypeId: string;
};

type RuleFormItem = {
  clientId: string;
  name: string;
};

type BenefitFormItem = {
  clientId: string;
  name: string;
};

type VenueImageFormItem = {
  clientId: string;
  file: File;
  previewUrl: string;
};

type ExistingVenueImage = {
  id?: number;
  url: string;
};

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

function createClientId() {
  return crypto.randomUUID();
}

export function VenueFormScreen({
  mode,
  venueId,
}: VenueFormScreenProps) {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();
  const [name, setName] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [provinceName, setProvinceName] = useState("");
  const [wardName, setWardName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [logo, setLogo] = useState<File | null>(null);
  const [currentBanner, setCurrentBanner] = useState("");
  const [currentLogo, setCurrentLogo] = useState("");
  const [courts, setCourts] = useState<CourtFormItem[]>([]);
  const [deletedCourtIds, setDeletedCourtIds] = useState<number[]>([]);
  const [rules, setRules] = useState<RuleFormItem[]>([]);
  const [existingRules, setExistingRules] = useState<string[]>([]);
  const [benefits, setBenefits] = useState<BenefitFormItem[]>([]);
  const [existingBenefits, setExistingBenefits] = useState<string[]>([]);
  const [venueImages, setVenueImages] = useState<VenueImageFormItem[]>([]);
  const venueImageUrlsRef = useRef(new Set<string>());
  const [existingVenueImages, setExistingVenueImages] = useState<
    ExistingVenueImage[]
  >([]);
  const [deletedVenueImageIds, setDeletedVenueImageIds] = useState<number[]>([]);
  const [sportTypes, setSportTypes] = useState<SportTypeResponse[]>([]);
  const [provinces, setProvinces] = useState<ProvinceResponse[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(true);
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
  const selectedProvince = useMemo(
    () =>
      provinces.find((province) => province.name === provinceName),
    [provinceName, provinces],
  );
  const wards = selectedProvince?.wards ?? [];

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
    const previewUrls = venueImageUrlsRef.current;

    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

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
    let active = true;

    async function loadSportTypes() {
      try {
        const data = await sportTypeService.getAll();

        if (active) {
          setSportTypes(data);
        }
      } catch {
        if (active) {
          setError("Không thể tải danh sách môn thể thao.");
        }
      }
    }

    void loadSportTypes();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadLocations() {
      try {
        setLoadingLocations(true);
        const data = await provinceService.getAllWithWards();

        if (active) {
          setProvinces(data);
        }
      } catch {
        if (active) {
          setError("Không thể tải danh sách tỉnh, thành phố.");
        }
      } finally {
        if (active) {
          setLoadingLocations(false);
        }
      }
    }

    void loadLocations();

    return () => {
      active = false;
    };
  }, []);

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

        const [venue, venueCourts] = await Promise.all([
          venueService.getById(currentVenueId),
          courtService.getByVenueId(currentVenueId),
        ]);

        if (!active) {
          return;
        }

        if (venue.ownerId !== currentUserId) {
          router.replace("/my-venues");
          return;
        }

        setName(venue.name);
        const addressParts = venue.address
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean);
        const hasLocationParts = addressParts.length >= 3;

        setStreetAddress(
          hasLocationParts
            ? addressParts.slice(0, -2).join(", ")
            : venue.address,
        );
        setWardName(
          hasLocationParts ? addressParts.at(-2) ?? "" : "",
        );
        setProvinceName(
          hasLocationParts ? addressParts.at(-1) ?? "" : "",
        );
        setLatitude(
          venue.latitude === null ? "" : String(venue.latitude),
        );
        setLongitude(
          venue.longitude === null ? "" : String(venue.longitude),
        );
        setCurrentBanner(venue.banner ?? "");
        setCurrentLogo(venue.logo ?? "");
        setExistingRules(venue.rules.map((rule) => rule.name));
        setExistingBenefits(venue.benefits.map((benefit) => benefit.name));
        setExistingVenueImages(venue.images);
        setCourts(
          venueCourts.map((court) => ({
            clientId: createClientId(),
            id: court.id,
            name: court.name,
            pricePerHour: String(court.pricePerHour),
            sportTypeId: court.sportTypeName,
          })),
        );
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

  function addCourt() {
    setCourts((current) => [
      ...current,
      {
        clientId: createClientId(),
        name: "",
        pricePerHour: "",
        sportTypeId: "",
      },
    ]);
  }

  function updateCourtField(
    clientId: string,
    field: "name" | "pricePerHour" | "sportTypeId",
    value: string,
  ) {
    setCourts((current) =>
      current.map((court) =>
        court.clientId === clientId
          ? { ...court, [field]: value }
          : court,
      ),
    );
  }

  function removeCourt(clientId: string) {
    const court = courts.find((item) => item.clientId === clientId);

    if (court?.id) {
      setDeletedCourtIds((current) => [...current, court.id!]);
    }

    setCourts((current) =>
      current.filter((court) => court.clientId !== clientId),
    );
  }

  function addRule() {
    setRules((current) => [
      ...current,
      {
        clientId: createClientId(),
        name: "",
      },
    ]);
  }

  function updateRuleName(clientId: string, value: string) {
    setRules((current) =>
      current.map((rule) =>
        rule.clientId === clientId
          ? { ...rule, name: value }
          : rule,
      ),
    );
  }

  function removeRule(clientId: string) {
    setRules((current) =>
      current.filter((rule) => rule.clientId !== clientId),
    );
  }

  function addBenefit() {
    setBenefits((current) => [
      ...current,
      {
        clientId: createClientId(),
        name: "",
      },
    ]);
  }

  function updateBenefitName(clientId: string, value: string) {
    setBenefits((current) =>
      current.map((benefit) =>
        benefit.clientId === clientId
          ? { ...benefit, name: value }
          : benefit,
      ),
    );
  }

  function removeBenefit(clientId: string) {
    setBenefits((current) =>
      current.filter((benefit) => benefit.clientId !== clientId),
    );
  }

  function selectVenueImages(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const invalidFile = files.find(
      (file) =>
        !file.type.startsWith("image/") ||
        file.size > MAX_IMAGE_SIZE,
    );

    if (invalidFile) {
      setError(
        "Mỗi ảnh sân phải là hình ảnh và không vượt quá 5MB.",
      );
      event.target.value = "";
      return;
    }

    setError("");
    const selectedImages = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);

      venueImageUrlsRef.current.add(previewUrl);

      return {
        clientId: createClientId(),
        file,
        previewUrl,
      };
    });

    setVenueImages((current) => [...current, ...selectedImages]);
    event.target.value = "";
  }

  function removeVenueImage(index: number) {
    setVenueImages((current) => {
      const image = current[index];

      if (image) {
        URL.revokeObjectURL(image.previewUrl);
        venueImageUrlsRef.current.delete(image.previewUrl);
      }

      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  function removeExistingVenueImage(imageId: number) {
    setExistingVenueImages((current) =>
      current.filter((image) => image.id !== imageId),
    );
    setDeletedVenueImageIds((current) => [...current, imageId]);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const normalizedName = name.trim();
    const normalizedStreetAddress = streetAddress.trim();
    const normalizedAddress = [
      normalizedStreetAddress,
      wardName,
      provinceName,
    ]
      .filter(Boolean)
      .join(", ");
    const parsedLatitude =
      latitude.trim() === "" ? undefined : Number(latitude);
    const parsedLongitude =
      longitude.trim() === "" ? undefined : Number(longitude);

    if (!normalizedName || !normalizedStreetAddress) {
      setError("Tên sân và số nhà, tên đường không được để trống.");
      return;
    }

    if (!provinceName || !wardName) {
      setError("Vui lòng chọn tỉnh/thành phố và phường/xã.");
      return;
    }

    if (normalizedAddress.length > 255) {
      setError("Địa chỉ đầy đủ không được vượt quá 255 ký tự.");
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

    const normalizedCourts = courts.map((court) => ({
      ...court,
      name: court.name.trim(),
      parsedPrice: Number(court.pricePerHour),
      parsedSportTypeId: /^\d+$/.test(court.sportTypeId)
        ? Number(court.sportTypeId)
        : sportTypes.find(
            (sportType) => sportType.name === court.sportTypeId,
          )?.id ?? 0,
    }));
    const invalidCourt = normalizedCourts.find(
      (court) =>
        !court.name ||
        !Number.isFinite(court.parsedPrice) ||
        court.parsedPrice < 0 ||
        !Number.isInteger(court.parsedSportTypeId) ||
        court.parsedSportTypeId <= 0,
    );

    if (invalidCourt) {
      setError(
        "Mỗi sân con phải có tên, giá hợp lệ và môn thể thao.",
      );
      return;
    }

    const normalizedRules = rules
      .map((rule) => ({
        ...rule,
        name: rule.name.trim(),
      }))
      .filter((rule) => rule.name !== "");
    const allRuleNames = [
      ...existingRules,
      ...normalizedRules.map((rule) => rule.name),
    ].map((rule) => rule.toLowerCase());

    if (new Set(allRuleNames).size !== allRuleNames.length) {
      setError("Nội quy trong cùng một sân không được trùng nhau.");
      return;
    }

    if (normalizedRules.some((rule) => rule.name.length > 255)) {
      setError("Mỗi nội quy không được vượt quá 255 ký tự.");
      return;
    }

    const normalizedBenefits = benefits
      .map((benefit) => ({
        ...benefit,
        name: benefit.name.trim(),
      }))
      .filter((benefit) => benefit.name !== "");
    const allBenefitNames = [
      ...existingBenefits,
      ...normalizedBenefits.map((benefit) => benefit.name),
    ].map((benefit) => benefit.toLowerCase());

    if (new Set(allBenefitNames).size !== allBenefitNames.length) {
      setError("Tiện ích trong cùng một sân không được trùng nhau.");
      return;
    }

    if (normalizedBenefits.some((benefit) => benefit.name.length > 100)) {
      setError("Mỗi tiện ích không được vượt quá 100 ký tự.");
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

      const savedVenue =
        mode === "edit" && venueId
          ? await venueService.update(venueId, payload)
          : await venueService.create(payload);
      const savedVenueId = savedVenue.id;

      await Promise.all(
        normalizedCourts.map((court) => {
          const courtPayload = {
            name: court.name,
            pricePerHour: court.parsedPrice,
            sportTypeId: court.parsedSportTypeId,
          };

          return court.id
            ? courtService.update(court.id, courtPayload)
            : courtService.create(savedVenueId, courtPayload);
        }),
      );

      await Promise.all(
        deletedCourtIds.map((courtId) =>
          courtService.remove(courtId),
        ),
      );

      await Promise.all(
        normalizedRules.map((rule) =>
          ruleService.create(savedVenueId, {
            name: rule.name,
          }),
        ),
      );

      await Promise.all(
        normalizedBenefits.map((benefit) =>
          benefitService.create(savedVenueId, {
            name: benefit.name,
          }),
        ),
      );

      await Promise.all(
        deletedVenueImageIds.map((imageId) =>
          venueImageService.remove(imageId),
        ),
      );

      if (venueImages.length > 0) {
        await venueImageService.upload(
          savedVenueId,
          venueImages.map((image) => image.file),
        );
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
                  htmlFor="venue-street-address"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Số nhà, tên đường
                </label>
                <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                  <MapPin className="size-5 shrink-0 text-[#ff174f]" />
                  <input
                    id="venue-street-address"
                    value={streetAddress}
                    onChange={(event) => setStreetAddress(event.target.value)}
                    maxLength={255}
                    required
                    disabled={submitting}
                    placeholder="Ví dụ: 110 Đào Sư Tích"
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Tỉnh/thành phố
                  </label>
                  <Select
                    value={provinceName}
                    onValueChange={(value) => {
                      setProvinceName(value ?? "");
                      setWardName("");
                    }}
                    disabled={submitting || loadingLocations}
                  >
                    <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-800 focus:ring-[#073b77]/10">
                      <SelectValue
                        placeholder={
                          loadingLocations
                            ? "Đang tải tỉnh/thành phố..."
                            : "Chọn tỉnh/thành phố"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {provinces.map((province) => (
                        <SelectItem
                          key={province.name}
                          value={province.name}
                        >
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Phường/xã
                  </label>
                  <Select
                    value={wardName}
                    onValueChange={(value) => setWardName(value ?? "")}
                    disabled={
                      submitting ||
                      loadingLocations ||
                      !provinceName
                    }
                  >
                    <SelectTrigger className="h-12 w-full rounded-xl border-slate-200 px-4 text-sm font-semibold text-slate-800 focus:ring-[#073b77]/10">
                      <SelectValue
                        placeholder={
                          provinceName
                            ? "Chọn phường/xã"
                            : "Chọn tỉnh/thành phố trước"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {wards.map((ward) => (
                        <SelectItem key={ward.name} value={ward.name}>
                          {ward.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

              <section className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-black text-[#073b77]">
                    Sân con
                  </h2>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={addCourt}
                    className="rounded-xl font-bold"
                  >
                    <CirclePlus className="size-4" />
                    Thêm sân con
                  </Button>
                </div>

                {courts.map((court, index) => (
                  <div
                    key={court.clientId}
                    className="grid gap-4 rounded-2xl border border-slate-200 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <div>
                      <label
                        htmlFor={`court-name-${court.clientId}`}
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Tên sân con {index + 1}
                      </label>
                      <input
                        id={`court-name-${court.clientId}`}
                        value={court.name}
                        maxLength={100}
                        disabled={submitting}
                        onChange={(event) =>
                          updateCourtField(
                            court.clientId,
                            "name",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-[#073b77]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`court-price-${court.clientId}`}
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Giá mỗi giờ
                      </label>
                      <input
                        id={`court-price-${court.clientId}`}
                        type="number"
                        min={0}
                        step={1000}
                        value={court.pricePerHour}
                        disabled={submitting}
                        onChange={(event) =>
                          updateCourtField(
                            court.clientId,
                            "pricePerHour",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-[#073b77]"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor={`court-sport-${court.clientId}`}
                        className="mb-2 block text-sm font-bold text-slate-700"
                      >
                        Môn thể thao
                      </label>
                      <select
                        id={`court-sport-${court.clientId}`}
                        value={
                          /^\d+$/.test(court.sportTypeId)
                            ? court.sportTypeId
                            : String(
                                sportTypes.find(
                                  (sportType) =>
                                    sportType.name ===
                                    court.sportTypeId,
                                )?.id ?? "",
                              )
                        }
                        disabled={submitting}
                        onChange={(event) =>
                          updateCourtField(
                            court.clientId,
                            "sportTypeId",
                            event.target.value,
                          )
                        }
                        className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold outline-none focus:border-[#073b77]"
                      >
                        <option value="">Chọn môn thể thao</option>
                        {sportTypes.map((sportType) => (
                          <option
                            key={sportType.id}
                            value={String(sportType.id)}
                          >
                            {sportType.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={submitting}
                        onClick={() => removeCourt(court.clientId)}
                        className="size-12 rounded-xl text-red-600"
                        aria-label={`Xóa sân con ${index + 1}`}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-black text-[#073b77]">
                    Tiện ích
                  </h2>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={addBenefit}
                    className="rounded-xl font-bold"
                  >
                    <CirclePlus className="size-4" />
                    Thêm tiện ích
                  </Button>
                </div>

                {existingBenefits.map((benefit) => (
                  <div
                    key={benefit}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {benefit}
                  </div>
                ))}

                {benefits.map((benefit, index) => (
                  <div key={benefit.clientId} className="flex gap-3">
                    <input
                      value={benefit.name}
                      maxLength={100}
                      disabled={submitting}
                      placeholder={`Tiện ích mới ${index + 1}`}
                      onChange={(event) =>
                        updateBenefitName(
                          benefit.clientId,
                          event.target.value,
                        )
                      }
                      className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-[#073b77]"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={submitting}
                      onClick={() => removeBenefit(benefit.clientId)}
                      className="size-12 rounded-xl text-red-600"
                      aria-label={`Xóa tiện ích mới ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-xl font-black text-[#073b77]">
                    Nội quy
                  </h2>

                  <Button
                    type="button"
                    variant="outline"
                    disabled={submitting}
                    onClick={addRule}
                    className="rounded-xl font-bold"
                  >
                    <CirclePlus className="size-4" />
                    Thêm nội quy
                  </Button>
                </div>

                {existingRules.map((rule) => (
                  <div
                    key={rule}
                    className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700"
                  >
                    {rule}
                  </div>
                ))}

                {rules.map((rule, index) => (
                  <div key={rule.clientId} className="flex gap-3">
                    <input
                      value={rule.name}
                      maxLength={255}
                      disabled={submitting}
                      placeholder={`Nội quy mới ${index + 1}`}
                      onChange={(event) =>
                        updateRuleName(
                          rule.clientId,
                          event.target.value,
                        )
                      }
                      className="h-12 min-w-0 flex-1 rounded-xl border border-slate-200 px-4 text-sm font-semibold outline-none focus:border-[#073b77]"
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      disabled={submitting}
                      onClick={() => removeRule(rule.clientId)}
                      className="size-12 rounded-xl text-red-600"
                      aria-label={`Xóa nội quy mới ${index + 1}`}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-6">
                <h2 className="text-xl font-black text-[#073b77]">
                  Hình ảnh sân
                </h2>

                <label className="grid min-h-36 cursor-pointer place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
                  <div className="flex flex-col items-center gap-2 text-sm font-semibold text-slate-500">
                    <ImageIcon className="size-7" />
                    Chọn nhiều hình ảnh
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    disabled={submitting}
                    onChange={selectVenueImages}
                    className="sr-only"
                  />
                </label>

                {(existingVenueImages.length > 0 ||
                  venueImages.length > 0) && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {existingVenueImages.map((image, index) => (
                      <div
                        key={image.id ?? image.url}
                        className="relative overflow-hidden rounded-2xl border border-slate-200"
                      >
                        <img
                          src={image.url}
                          alt={`Ảnh sân hiện tại ${index + 1}`}
                          className="aspect-[4/3] w-full object-cover"
                        />
                        {image.id !== undefined && (
                          <Button
                            type="button"
                            size="icon"
                            disabled={submitting}
                            onClick={() =>
                              removeExistingVenueImage(image.id!)
                            }
                            className="absolute right-2 top-2 size-9 rounded-full bg-red-600 text-white hover:bg-red-700"
                            aria-label={`Xóa ảnh sân hiện tại ${index + 1}`}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    ))}

                    {venueImages.map((image, index) => (
                      <SelectedVenueImage
                        key={image.clientId}
                        image={image}
                        index={index}
                        disabled={submitting}
                        onRemove={removeVenueImage}
                      />
                    ))}
                  </div>
                )}
              </section>

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

type SelectedVenueImageProps = {
  image: VenueImageFormItem;
  index: number;
  disabled: boolean;
  onRemove: (index: number) => void;
};

function SelectedVenueImage({
  image,
  index,
  disabled,
  onRemove,
}: SelectedVenueImageProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200">
      <img
        src={image.previewUrl}
        alt={`Ảnh sân mới ${index + 1}`}
        className="aspect-[4/3] w-full object-cover"
      />

      <Button
        type="button"
        size="icon"
        disabled={disabled}
        onClick={() => onRemove(index)}
        className="absolute right-2 top-2 size-9 rounded-full bg-red-600 text-white hover:bg-red-700"
        aria-label={`Xóa ảnh sân mới ${index + 1}`}
      >
        <Trash2 className="size-4" />
      </Button>
    </div>
  );
}
