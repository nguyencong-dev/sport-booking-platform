"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  Eye,
  EyeOff,
  ImagePlus,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
  UserRoundPlus,
  X,
} from "lucide-react";
import {
  useEffect,
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
import { authService } from "@/services/auth.service";
import type {
  AuthErrorResponse,
  RegistrationRole,
} from "@/types/auth";

export function RegisterScreen() {
  const router = useRouter();
  const { isAuthenticated, ready } = useAuth();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<RegistrationRole>("CUSTOMER");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, ready, router]);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Ảnh đại diện phải là một file hình ảnh.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Ảnh đại diện không được vượt quá 5 MB.");
      event.target.value = "";
      return;
    }

    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError("");
  }

  function removeAvatar() {
    setAvatar(null);
    setAvatarPreview(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      await authService.register({
        email,
        password,
        phoneNumber,
        firstName,
        lastName,
        role,
        avatar,
      });

      router.replace("/login");
    } catch (requestError) {
      if (axios.isAxiosError<AuthErrorResponse>(requestError)) {
        const fieldErrors = requestError.response?.data?.fieldErrors;
        const firstFieldError = fieldErrors
          ? Object.values(fieldErrors)[0]
          : undefined;

        setError(
          firstFieldError ??
            requestError.response?.data?.message ??
            "Không thể đăng ký tài khoản.",
        );
      } else {
        setError("Đã xảy ra lỗi khi đăng ký.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb] px-4 py-10 sm:px-6 sm:py-14">
      <Card className="w-full max-w-2xl gap-0 overflow-hidden rounded-3xl border-0 bg-white py-0 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
        <section className="px-2 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto w-full max-w-xl">
            <CardHeader className="px-4 sm:px-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff174f]">
                Tham gia FieldMate
              </p>
              <CardTitle className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
                Tạo tài khoản
              </CardTitle>
            </CardHeader>

            <CardContent className="mt-7 px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <fieldset>
                  <legend className="mb-3 text-sm font-bold text-slate-700">
                    Bạn muốn sử dụng FieldMate để làm gì?
                  </legend>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition ${role === "CUSTOMER" ? "border-[#ff174f] bg-rose-50 ring-2 ring-rose-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="CUSTOMER"
                        checked={role === "CUSTOMER"}
                        onChange={() => setRole("CUSTOMER")}
                        disabled={submitting}
                        className="sr-only"
                      />

                      <span className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#ff174f] shadow-sm">
                          <UserRound className="size-5" />
                        </span>
                        <span>
                          <span className="block font-black text-[#073b77]">
                            Tôi muốn đặt sân
                          </span>
                          <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                            Tìm kiếm, đặt lịch và thanh toán sân thể thao.
                          </span>
                        </span>
                      </span>
                    </label>

                    <label
                      className={`cursor-pointer rounded-2xl border p-4 transition ${role === "COURT_OWNER" ? "border-[#073b77] bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-slate-300"}`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value="COURT_OWNER"
                        checked={role === "COURT_OWNER"}
                        onChange={() => setRole("COURT_OWNER")}
                        disabled={submitting}
                        className="sr-only"
                      />

                      <span className="flex items-start gap-3">
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#073b77] shadow-sm">
                          <Building2 className="size-5" />
                        </span>
                        <span>
                          <span className="block font-black text-[#073b77]">
                            Tôi là chủ sân
                          </span>
                          <span className="mt-1 block text-xs font-medium leading-5 text-slate-500">
                            Đăng sân, quản lý lịch đặt và tài khoản thanh toán.
                          </span>
                        </span>
                      </span>
                    </label>
                  </div>
                </fieldset>

                <div className="flex flex-col items-center">
                  <div className="relative">
                    <label
                      htmlFor="avatar"
                      className="grid size-24 cursor-pointer place-items-center overflow-hidden rounded-full border-2 border-dashed border-slate-200 bg-slate-50 transition hover:border-[#ff174f]"
                    >
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="Ảnh đại diện đã chọn"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="text-center text-slate-400">
                          <ImagePlus className="mx-auto size-6" />
                          <span className="mt-1 block text-xs font-semibold">
                            Chọn ảnh
                          </span>
                        </div>
                      )}

                      <input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        disabled={submitting}
                        className="sr-only"
                      />
                    </label>

                    {avatarPreview && (
                      <button
                        type="button"
                        onClick={removeAvatar}
                        aria-label="Xóa ảnh đại diện"
                        className="absolute -right-1 top-0 grid size-7 place-items-center rounded-full bg-[#ff174f] text-white shadow-md transition hover:bg-[#e8003e]"
                      >
                        <X className="size-4" />
                      </button>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Không bắt buộc, tối đa 5 MB
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="lastName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Họ
                    </label>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                      <UserRound className="size-5 shrink-0 text-slate-400" />
                      <input
                        id="lastName"
                        type="text"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        autoComplete="family-name"
                        placeholder="Nguyễn"
                        required
                        disabled={submitting}
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="firstName"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Tên
                    </label>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                      <UserRound className="size-5 shrink-0 text-slate-400" />
                      <input
                        id="firstName"
                        type="text"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        autoComplete="given-name"
                        placeholder="Công"
                        required
                        disabled={submitting}
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Email
                  </label>
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                    <Mail className="size-5 shrink-0 text-slate-400" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      autoComplete="email"
                      placeholder="example@email.com"
                      required
                      disabled={submitting}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="mb-2 block text-sm font-bold text-slate-700"
                  >
                    Số điện thoại
                  </label>
                  <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                    <Phone className="size-5 shrink-0 text-slate-400" />
                    <input
                      id="phoneNumber"
                      type="tel"
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
                      autoComplete="tel"
                      placeholder="0901234567"
                      required
                      disabled={submitting}
                      className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                    />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="password"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Mật khẩu
                    </label>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                      <LockKeyhole className="size-5 shrink-0 text-slate-400" />
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        autoComplete="new-password"
                        placeholder="Nhập mật khẩu"
                        required
                        disabled={submitting}
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((current) => !current)}
                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                        className="text-slate-400 transition-colors hover:text-[#073b77]"
                      >
                        {showPassword ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="mb-2 block text-sm font-bold text-slate-700"
                    >
                      Xác nhận mật khẩu
                    </label>
                    <div className="flex h-12 items-center rounded-xl border border-slate-200 bg-white px-4 transition focus-within:border-[#073b77] focus-within:ring-2 focus-within:ring-[#073b77]/10">
                      <LockKeyhole className="size-5 shrink-0 text-slate-400" />
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(event) =>
                          setConfirmPassword(event.target.value)
                        }
                        autoComplete="new-password"
                        placeholder="Nhập lại mật khẩu"
                        required
                        disabled={submitting}
                        className="h-full min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword((current) => !current)
                        }
                        aria-label={
                          showConfirmPassword
                            ? "Ẩn mật khẩu xác nhận"
                            : "Hiện mật khẩu xác nhận"
                        }
                        className="text-slate-400 transition-colors hover:text-[#073b77]"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="size-5" />
                        ) : (
                          <Eye className="size-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600"
                  >
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full rounded-xl bg-[#ff174f] text-base font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-[#e8003e]"
                >
                  <UserRoundPlus className="size-5" />
                  {submitting ? "Đang đăng ký..." : "Tạo tài khoản"}
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Bạn đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="font-bold text-[#ff174f] hover:underline"
                >
                  Đăng nhập
                </Link>
              </p>
            </CardContent>
          </div>
        </section>
      </Card>
    </main>
  );
}
