"use client";

import axios from "axios";
import { Edit3, ExternalLink, ImagePlus, Trash2, X } from "lucide-react";
import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  AdminEmpty,
  AdminError,
  AdminLoading,
  AdminPageHeader,
  formatDateTime,
} from "@/components/Admin/AdminPage";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { bannerService } from "@/services/banner.service";
import type { HeroBannerResponse } from "@/types/banner";

type ApiErrorResponse = {
  message?: string;
};

export function AdminBannersScreen() {
  const [banners, setBanners] = useState<HeroBannerResponse[]>([]);
  const [image, setImage] = useState<File | null>(null);
  const [targetUrl, setTargetUrl] = useState("");
  const [editing, setEditing] =
    useState<HeroBannerResponse | null>(null);
  const [deleting, setDeleting] =
    useState<HeroBannerResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadBanners() {
      try {
        setLoading(true);
        setError("");
        setBanners(await bannerService.getAll());
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải danh sách banner.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải banner.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadBanners();
  }, []);

  function resetForm() {
    setImage(null);
    setTargetUrl("");
    setEditing(null);
  }

  function startEditing(banner: HeroBannerResponse) {
    setEditing(banner);
    setTargetUrl(banner.targetUrl ?? "");
    setImage(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editing && !image) {
      setError("Vui lòng chọn ảnh banner.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      if (editing) {
        const updated = await bannerService.update(editing.id, {
          image,
          targetUrl,
        });
        setBanners((current) =>
          current.map((banner) =>
            banner.id === updated.id ? updated : banner,
          ),
        );
      } else {
        const created = await bannerService.create({
          image,
          targetUrl,
        });
        setBanners((current) => [...current, created]);
      }

      resetForm();
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể lưu banner.",
        );
      } else {
        setError("Đã xảy ra lỗi khi lưu banner.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!deleting) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      await bannerService.remove(deleting.id);
      setBanners((current) =>
        current.filter((banner) => banner.id !== deleting.id),
      );
      if (editing?.id === deleting.id) {
        resetForm();
      }
      setDeleting(null);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể xóa banner.",
        );
      } else {
        setError("Đã xảy ra lỗi khi xóa banner.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Nội dung trang chủ"
        title="Banner"
      />

      <AdminError message={error} />

      <section className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-black text-[#073b77]">
              {editing ? `Chỉnh sửa banner #${editing.id}` : "Thêm banner"}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500">
              {editing
                ? "Có thể giữ nguyên ảnh hiện tại và chỉ đổi đường dẫn."
                : "Ảnh là bắt buộc khi tạo banner mới."}
            </p>
          </div>
          {editing && (
            <Button
              type="button"
              variant="ghost"
              onClick={resetForm}
              className="rounded-xl"
            >
              <X className="size-4" />
              Hủy chỉnh sửa
            </Button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
        >
          <label className="text-sm font-bold text-slate-700">
            Ảnh banner
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setImage(event.target.files?.[0] ?? null)
              }
              className="mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-1 file:font-bold file:text-[#ff174f]"
            />
          </label>
          <label className="text-sm font-bold text-slate-700">
            Đường dẫn đích
            <input
              type="url"
              value={targetUrl}
              onChange={(event) => setTargetUrl(event.target.value)}
              maxLength={500}
              placeholder="https://..."
              className="mt-2 block h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
            />
          </label>
          <Button
            type="submit"
            disabled={submitting || (!editing && !image)}
            className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white hover:bg-[#e8003e]"
          >
            <ImagePlus className="size-4" />
            {editing ? "Lưu thay đổi" : "Thêm banner"}
          </Button>
        </form>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <AdminLoading />
        ) : banners.length === 0 ? (
          <AdminEmpty label="Chưa có banner nào." />
        ) : (
          <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
            {banners.map((banner) => (
              <article
                key={banner.id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
              >
                <div className="aspect-[16/7] overflow-hidden bg-slate-100">
                  <img
                    src={banner.url}
                    alt={`Banner #${banner.id}`}
                    className="size-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-black text-[#073b77]">
                        Banner #{banner.id}
                      </h2>
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {formatDateTime(banner.createdAt)}
                      </p>
                    </div>
                    {banner.targetUrl && (
                      <a
                        href={banner.targetUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="grid size-9 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#246bfe]"
                        aria-label="Mở đường dẫn banner"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                  <p className="mt-3 truncate text-xs font-medium text-slate-500">
                    {banner.targetUrl || "Không có đường dẫn đích"}
                  </p>
                  <div className="mt-4 flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => startEditing(banner)}
                      className="h-9 flex-1 rounded-xl"
                    >
                      <Edit3 className="size-4" />
                      Chỉnh sửa
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setDeleting(banner)}
                      className="h-9 rounded-xl"
                    >
                      <Trash2 className="size-4" />
                      Xóa
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <ConfirmationDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title="Xóa banner?"
        description={`Banner #${deleting?.id ?? ""} sẽ bị xóa khỏi trang chủ.`}
        confirmLabel="Xóa banner"
        variant="destructive"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </>
  );
}
