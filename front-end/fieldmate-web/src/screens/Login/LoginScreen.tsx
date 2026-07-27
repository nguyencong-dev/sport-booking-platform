"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  LogIn,
  Mail,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { authService } from "@/services/auth.service";
import type { AuthErrorResponse } from "@/types/auth";

export function LoginScreen() {
  const router = useRouter();
  const { user, isAuthenticated, ready, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && isAuthenticated) {
      router.replace(
        user?.role === "COURT_OWNER" ? "/my-venues" : "/",
      );
    }
  }, [isAuthenticated, ready, router, user]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await authService.login({
        email: email.trim(),
        password,
      });

      const currentUser = await signIn(response.token);
      router.replace(
        currentUser.role === "COURT_OWNER" ? "/my-venues" : "/",
      );
      router.refresh();
    } catch (requestError) {
      if (axios.isAxiosError<AuthErrorResponse>(requestError)) {
        setError(
          requestError.response?.data?.message ??
            "Email hoặc mật khẩu không chính xác.",
        );
      } else {
        setError("Đã xảy ra lỗi khi đăng nhập.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb] px-4 py-10 sm:px-6 sm:py-14">
      <Card className="w-full max-w-lg gap-0 overflow-hidden rounded-3xl border-0 bg-white py-0 shadow-[0_24px_70px_rgba(15,23,42,0.12)] ring-1 ring-slate-100">
        <section className="px-2 py-8 sm:px-6 sm:py-12">
          <div className="mx-auto w-full max-w-md">
            <CardHeader className="px-4 sm:px-6">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff174f]">
                Chào mừng trở lại
              </p>
              <CardTitle className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
                Đăng nhập
              </CardTitle>
            </CardHeader>

            <CardContent className="mt-7 px-4 sm:px-6">
              <form onSubmit={handleSubmit} className="space-y-5">
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
                      autoComplete="current-password"
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
                  <LogIn className="size-5" />
                  {submitting ? "Đang đăng nhập..." : "Đăng nhập"}
                </Button>
              </form>

              <p className="mt-7 text-center text-sm text-slate-500">
                Bạn chưa có tài khoản?{" "}
                <Link
                  href="/register"
                  className="font-bold text-[#ff174f] hover:underline"
                >
                  Đăng ký ngay
                </Link>
              </p>
            </CardContent>
          </div>
        </section>
      </Card>
    </main>
  );
}
