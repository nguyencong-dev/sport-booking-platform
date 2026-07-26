"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  LoaderCircle,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useEffect, type ElementType } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";

const roleLabels = {
  CUSTOMER: "Khách hàng",
  COURT_OWNER: "Chủ sân",
  ADMIN: "Quản trị viên",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
}

export function ProfileScreen() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();

  useEffect(() => {
    if (ready && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, ready, router]);

  if (!ready) {
    return (
      <main className="flex min-h-[calc(100vh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-[#ff174f]" />
          Đang tải thông tin...
        </div>
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
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#ff174f]">
            Tài khoản của tôi
          </p>

          <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
            Thông tin cá nhân
          </h1>

        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <Card className="h-fit rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
            <CardContent className="flex flex-col items-center px-6 py-8 text-center">
              <Avatar className="size-28">
                {user.avatar && (
                  <AvatarImage src={user.avatar} alt={fullName} />
                )}

                <AvatarFallback className="bg-[#073b77] text-3xl font-black text-white">
                  {initials || <UserRound className="size-10" />}
                </AvatarFallback>
              </Avatar>

              <h2 className="mt-5 text-xl font-black text-[#073b77]">
                {fullName}
              </h2>

              <p className="mt-1 break-all text-sm text-slate-500">
                {user.email}
              </p>

              <Badge className="mt-4 rounded-full bg-rose-50 px-3 py-1 text-[#ff174f]">
                {roleLabels[user.role]}
              </Badge>

              <Separator className="my-6" />

              <div className="w-full space-y-3">
                <Button
                  nativeButton={false}
                  render={<Link href="/profile/edit" />}
                  className="h-11 w-full rounded-xl bg-[#ff174f] font-bold text-white shadow-md shadow-rose-500/20 hover:bg-[#e8003e]"
                >
                  Chỉnh sửa thông tin
                </Button>

                <Button
                  nativeButton={false}
                  variant="outline"
                  render={<Link href="/bookings" />}
                  className="h-11 w-full rounded-xl"
                >
                  <CalendarDays className="size-4" />
                  Lịch đặt của tôi
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border-0 bg-white shadow-sm ring-1 ring-slate-100">
            <CardHeader className="px-6 pt-7 sm:px-8">
              <CardTitle className="text-xl font-black text-[#073b77]">
                Chi tiết tài khoản
              </CardTitle>

            </CardHeader>

            <CardContent className="px-6 pb-8 sm:px-8">
              <div className="mt-3 divide-y divide-slate-100">
                <ProfileItem
                  icon={UserRound}
                  label="Họ và tên"
                  value={fullName}
                />

                <ProfileItem
                  icon={Mail}
                  label="Email"
                  value={user.email}
                />

                <ProfileItem
                  icon={Phone}
                  label="Số điện thoại"
                  value={user.phoneNumber || "Chưa cập nhật"}
                />

                <ProfileItem
                  icon={ShieldCheck}
                  label="Vai trò"
                  value={roleLabels[user.role]}
                />

                <ProfileItem
                  icon={LockKeyhole}
                  label="Trạng thái tài khoản"
                  value={user.enabled ? "Đang hoạt động" : "Đã bị khóa"}
                  valueClassName={
                    user.enabled ? "text-emerald-600" : "text-red-600"
                  }
                />

                <ProfileItem
                  icon={CalendarDays}
                  label="Ngày tham gia"
                  value={formatDate(user.createdAt)}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

type ProfileItemProps = {
  icon: ElementType;
  label: string;
  value: string;
  valueClassName?: string;
};

function ProfileItem({
  icon: Icon,
  label,
  value,
  valueClassName = "text-slate-800",
}: ProfileItemProps) {
  return (
    <div className="grid gap-2 py-5 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
      <div className="flex items-center gap-3 text-sm font-semibold text-slate-500">
        <span className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-[#073b77]">
          <Icon className="size-4" />
        </span>

        {label}
      </div>

      <p className={`break-words font-bold sm:text-right ${valueClassName}`}>
        {value}
      </p>
    </div>
  );
}
