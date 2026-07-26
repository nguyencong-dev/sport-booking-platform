"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import {
  Camera,
  LoaderCircle,
  Phone,
  Save,
  UserRound,
  X,
} from "lucide-react";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import type { AuthErrorResponse } from "@/types/auth";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export function ProfileEditScreen() {
  const router = useRouter();
  const {
    user,
    ready,
    isAuthenticated,
    syncUser,
  } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login?redirect=/profile/edit");
    }
  }, [isAuthenticated, ready, router]);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setPhoneNumber(user.phoneNumber ?? "");
    setAvatarPreview(user.avatar ?? "");
  }, [user]);

  useEffect(() => {
    if (!avatar) {
      return;
    }

    const previewUrl = URL.createObjectURL(avatar);
    setAvatarPreview(previewUrl);

    return () => {
      URL.revokeObjectURL(previewUrl);
    };
  }, [avatar]);

  function handleAvatarChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Avatar phải là file hình ảnh.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setError("Kích thước avatar không được vượt quá 5MB.");
      event.target.value = "";
      return;
    }

    setError("");
    setAvatar(file);
  }

  function removeSelectedAvatar() {
    setAvatar(null);
    setAvatarPreview(user?.avatar ?? "");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedFirstName = firstName.trim();
    const normalizedLastName = lastName.trim();
    const normalizedPhoneNumber = phoneNumber.trim();

    if (!normalizedFirstName || !normalizedLastName) {
      setError("Họ và tên không được để trống.");
      return;
    }

    if (!/^[0-9]{9,15}$/.test(normalizedPhoneNumber)) {
      setError("Số điện thoại phải có từ 9 đến 15 chữ số.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const updatedUser =
        await userService.updateCurrentUser({
          firstName: normalizedFirstName,
          lastName: normalizedLastName,
          phoneNumber: normalizedPhoneNumber,
          avatar,
        });

      syncUser(updatedUser);
      router.push("/profile");
      router.refresh();
    } catch (requestError) {
      if (
        axios.isAxiosError<AuthErrorResponse>(
          requestError,
        )
      ) {
        const fieldErrors =
          requestError.response?.data?.fieldErrors;

        const firstFieldError =
          fieldErrors && Object.values(fieldErrors)[0];

        setError(
          firstFieldError ??
            requestError.response?.data?.message ??
            "Không thể cập nhật thông tin.",
        );
      } else {
        setError("Không thể cập nhật thông tin.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const fullName = [user.lastName, user.firstName]
    .filter(Boolean)
    .join(" ");

  const initials =
    `${user.lastName?.charAt(0) ?? ""}${
      user.firstName?.charAt(0) ?? ""
    }`.toUpperCase();

  return (
    <main className="flex-1 bg-[#f6f8fb] px-4 py-10 sm:px-6 lg:py-14">
      <div className="mx-auto w-full max-w-3xl">
        <h1 className="mb-8 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
          Chỉnh sửa thông tin
        </h1>

        <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
          <CardHeader className="px-6 pt-7 sm:px-8">
            <CardTitle className="text-xl font-black text-[#073b77]">
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-8 sm:px-8">
            <form
              onSubmit={handleSubmit}
              className="space-y-6"
            >
              <div className="flex flex-col items-center gap-4 rounded-2xl bg-slate-50 p-6 sm:flex-row">
                <Avatar className="size-24">
                  {avatarPreview && (
                    <AvatarImage
                      src={avatarPreview}
                      alt={fullName}
                    />
                  )}

                  <AvatarFallback className="bg-[#073b77] text-2xl font-black text-white">
                    {initials || (
                      <UserRound className="size-9" />
                    )}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
                  <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-[#073b77] px-4 text-sm font-bold text-white transition hover:bg-[#052f60]">
                    <Camera className="size-4" />
                    Chọn avatar

                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      disabled={submitting}
                      className="sr-only"
                    />
                  </label>

                  {avatar && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeSelectedAvatar}
                      disabled={submitting}
                      className="rounded-xl"
                    >
                      <X className="size-4" />
                      Bỏ ảnh đã chọn
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="last-name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Họ
                  </label>

                  <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                    <UserRound className="size-5 shrink-0 text-slate-400" />

                    <input
                      id="last-name"
                      value={lastName}
                      onChange={(event) =>
                        setLastName(event.target.value)
                      }
                      maxLength={50}
                      required
                      disabled={submitting}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="first-name"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Tên
                  </label>

                  <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                    <UserRound className="size-5 shrink-0 text-slate-400" />

                    <input
                      id="first-name"
                      value={firstName}
                      onChange={(event) =>
                        setFirstName(event.target.value)
                      }
                      maxLength={50}
                      required
                      disabled={submitting}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="phone-number"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Số điện thoại
                </label>

                <div className="flex h-12 items-center rounded-xl border border-slate-200 px-4 focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                  <Phone className="size-5 shrink-0 text-slate-400" />

                  <input
                    id="phone-number"
                    type="tel"
                    inputMode="numeric"
                    value={phoneNumber}
                    onChange={(event) =>
                      setPhoneNumber(
                        event.target.value.replace(/\D/g, ""),
                      )
                    }
                    minLength={9}
                    maxLength={15}
                    required
                    disabled={submitting}
                    className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm font-semibold text-slate-800 outline-none"
                  />
                </div>
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
                  onClick={() => router.push("/profile")}
                  disabled={submitting}
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

                  {submitting
                    ? "Đang lưu..."
                    : "Lưu thay đổi"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
