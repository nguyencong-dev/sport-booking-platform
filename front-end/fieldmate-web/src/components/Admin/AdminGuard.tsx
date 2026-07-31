"use client";

import { LoaderCircle } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

import { useAuth } from "@/contexts/AuthContext";

export function AdminGuard({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace(
        `/login?redirect=${encodeURIComponent(pathname || "/admin")}`,
      );
      return;
    }

    if (user?.role !== "ADMIN") {
      router.replace(
        user?.role === "COURT_OWNER" ? "/my-venues" : "/",
      );
    }
  }, [isAuthenticated, pathname, ready, router, user]);

  if (!ready || !user || user.role !== "ADMIN") {
    return (
      <main className="grid min-h-screen flex-1 place-items-center bg-slate-100">
        <div className="flex items-center gap-3 font-semibold text-slate-500">
          <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
          Đang kiểm tra quyền quản trị...
        </div>
      </main>
    );
  }

  return children;
}
