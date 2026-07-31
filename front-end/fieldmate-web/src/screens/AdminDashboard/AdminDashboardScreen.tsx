import Link from "next/link";
import {
  Building2,
  CalendarDays,
  CreditCard,
  Image,
  Trophy,
  Users,
} from "lucide-react";

import { AdminPageHeader } from "@/components/Admin/AdminPage";

const modules = [
  {
    title: "Người dùng",
    description: "Quản lý tài khoản và trạng thái hoạt động.",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Duyệt sân",
    description: "Kiểm tra các sân đang chờ phê duyệt.",
    href: "/admin/venues",
    icon: Building2,
  },
  {
    title: "Môn thể thao",
    description: "Quản lý danh mục môn thể thao.",
    href: "/admin/sport-types",
    icon: Trophy,
  },
  {
    title: "Lịch đặt sân",
    description: "Theo dõi toàn bộ booking trên hệ thống.",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "Tài khoản thanh toán",
    description: "Duyệt và điều chỉnh trạng thái tài khoản.",
    href: "/admin/payment-accounts",
    icon: CreditCard,
  },
  {
    title: "Banner",
    description: "Quản lý nội dung banner trên trang chủ.",
    href: "/admin/banners",
    icon: Image,
  },
];

export function AdminDashboardScreen() {
  return (
    <>
      <AdminPageHeader
        eyebrow="FieldMate Admin"
        title="Tổng quan quản trị"
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon;

          return (
            <Link
              key={module.href}
              href={module.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-rose-200 hover:shadow-lg"
            >
              <span className="grid size-11 place-items-center rounded-xl bg-rose-50 text-[#ff174f] transition group-hover:bg-[#ff174f] group-hover:text-white">
                <Icon className="size-5" />
              </span>
              <h2 className="mt-5 text-lg font-black text-[#073b77]">
                {module.title}
              </h2>
              <p className="mt-2 text-sm font-medium leading-6 text-slate-500">
                {module.description}
              </p>
            </Link>
          );
        })}
      </div>
    </>
  );
}
