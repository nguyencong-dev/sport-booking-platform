"use client";

import axios from "axios";
import { Check, Edit3, Plus, Trash2, X } from "lucide-react";
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
} from "@/components/Admin/AdminPage";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import { Button } from "@/components/ui/button";
import { sportTypeService } from "@/services/sport-type.service";
import type { SportTypeResponse } from "@/types/sport-type";

type ApiErrorResponse = {
  message?: string;
};

export function AdminSportTypesScreen() {
  const [sportTypes, setSportTypes] = useState<SportTypeResponse[]>([]);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deleting, setDeleting] =
    useState<SportTypeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSportTypes() {
      try {
        setLoading(true);
        setError("");
        setSportTypes(await sportTypeService.getAll());
      } catch (requestError) {
        if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
          setError(
            requestError.response?.data?.message ??
              "Không thể tải danh mục môn thể thao.",
          );
        } else {
          setError("Đã xảy ra lỗi khi tải danh mục.");
        }
      } finally {
        setLoading(false);
      }
    }

    void loadSportTypes();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const created = await sportTypeService.create({
        name: name.trim(),
      });
      setSportTypes((current) => [...current, created]);
      setName("");
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể thêm môn thể thao.",
        );
      } else {
        setError("Đã xảy ra lỗi khi thêm danh mục.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(sportTypeId: number) {
    if (!editingName.trim()) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const updated = await sportTypeService.update(sportTypeId, {
        name: editingName.trim(),
      });
      setSportTypes((current) =>
        current.map((sportType) =>
          sportType.id === updated.id ? updated : sportType,
        ),
      );
      setEditingId(null);
      setEditingName("");
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể cập nhật môn thể thao.",
        );
      } else {
        setError("Đã xảy ra lỗi khi cập nhật danh mục.");
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
      await sportTypeService.remove(deleting.id);
      setSportTypes((current) =>
        current.filter(
          (sportType) => sportType.id !== deleting.id,
        ),
      );
      setDeleting(null);
    } catch (requestError) {
      if (axios.isAxiosError<ApiErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Không thể xóa môn thể thao đang được sử dụng.",
        );
      } else {
        setError("Đã xảy ra lỗi khi xóa danh mục.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Danh mục hệ thống"
        title="Môn thể thao"
      />

      <AdminError message={error} />

      <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
        <section className="self-start rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-black text-[#073b77]">
            Thêm môn thể thao
          </h2>
          <p className="mt-1 text-sm font-medium text-slate-500">
            Tên danh mục tối đa 100 ký tự.
          </p>
          <form onSubmit={handleCreate} className="mt-5 space-y-3">
            <label
              htmlFor="sport-type-name"
              className="text-sm font-bold text-slate-700"
            >
              Tên môn thể thao
            </label>
            <input
              id="sport-type-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
              placeholder="Ví dụ: Pickleball"
              className="h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none transition focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
            />
            <Button
              type="submit"
              disabled={submitting || !name.trim()}
              className="h-11 w-full rounded-xl bg-[#ff174f] font-bold text-white hover:bg-[#e8003e]"
            >
              <Plus className="size-4" />
              Thêm danh mục
            </Button>
          </form>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {loading ? (
            <AdminLoading />
          ) : sportTypes.length === 0 ? (
            <AdminEmpty label="Chưa có môn thể thao nào." />
          ) : (
            <div className="divide-y divide-slate-100">
              {sportTypes.map((sportType) => {
                const editing = editingId === sportType.id;

                return (
                  <div
                    key={sportType.id}
                    className="flex flex-wrap items-center gap-3 px-5 py-4"
                  >
                    <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-sm font-black text-[#073b77]">
                      #{sportType.id}
                    </span>
                    {editing ? (
                      <input
                        autoFocus
                        value={editingName}
                        onChange={(event) =>
                          setEditingName(event.target.value)
                        }
                        maxLength={100}
                        className="h-10 min-w-48 flex-1 rounded-xl border border-slate-200 px-3 text-sm font-bold outline-none focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
                      />
                    ) : (
                      <p className="min-w-48 flex-1 font-bold text-slate-700">
                        {sportType.name}
                      </p>
                    )}
                    <div className="flex gap-2">
                      {editing ? (
                        <>
                          <Button
                            type="button"
                            size="icon-lg"
                            disabled={
                              submitting || !editingName.trim()
                            }
                            onClick={() =>
                              void handleUpdate(sportType.id)
                            }
                            className="rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                          >
                            <Check className="size-4" />
                            <span className="sr-only">Lưu</span>
                          </Button>
                          <Button
                            type="button"
                            size="icon-lg"
                            variant="outline"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            className="rounded-xl"
                          >
                            <X className="size-4" />
                            <span className="sr-only">Hủy sửa</span>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            type="button"
                            size="icon-lg"
                            variant="outline"
                            onClick={() => {
                              setEditingId(sportType.id);
                              setEditingName(sportType.name);
                            }}
                            className="rounded-xl"
                          >
                            <Edit3 className="size-4" />
                            <span className="sr-only">Chỉnh sửa</span>
                          </Button>
                          <Button
                            type="button"
                            size="icon-lg"
                            variant="destructive"
                            onClick={() => setDeleting(sportType)}
                            className="rounded-xl"
                          >
                            <Trash2 className="size-4" />
                            <span className="sr-only">Xóa</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <ConfirmationDialog
        open={Boolean(deleting)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleting(null);
          }
        }}
        title="Xóa môn thể thao?"
        description={`Danh mục ${deleting?.name ?? ""} sẽ bị xóa vĩnh viễn. Thao tác có thể thất bại nếu danh mục đang được sân sử dụng.`}
        confirmLabel="Xóa danh mục"
        variant="destructive"
        loading={submitting}
        onConfirm={handleDelete}
      />
    </>
  );
}
