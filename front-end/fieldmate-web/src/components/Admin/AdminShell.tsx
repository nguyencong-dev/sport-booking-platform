"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BrainCircuit,
  Building2,
  CalendarDays,
  ChevronRight,
  CreditCard,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const adminNavigation = [
  {
    label: "Tổng quan",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Người dùng",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Duyệt sân",
    href: "/admin/venues",
    icon: Building2,
  },
  {
    label: "Môn thể thao",
    href: "/admin/sport-types",
    icon: Trophy,
  },
  {
    label: "Lịch đặt sân",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    label: "Tài khoản thanh toán",
    href: "/admin/payment-accounts",
    icon: CreditCard,
  },
  {
    label: "Banner",
    href: "/admin/banners",
    icon: Image,
  },
  {
    label: "Kho tri thức AI",
    href: "/admin/ai-documents",
    icon: BrainCircuit,
  },
];

function isActiveRoute(pathname: string, href: string) {
  if (href === "/admin") {
    return pathname === href;
  }

  if (
    href === "/admin/bookings" &&
    pathname.startsWith("/admin/payments/")
  ) {
    return true;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-3">
      <span className="grid size-11 place-items-center rounded-2xl bg-[#ff174f] text-white shadow-lg shadow-rose-950/20">
        <ShieldCheck className="size-5" />
      </span>
      <span>
        <span className="block text-lg font-black tracking-[-0.03em] text-white">
          FieldMate
        </span>
        <span className="block text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
          Quản trị hệ thống
        </span>
      </span>
    </Link>
  );
}

function AdminNavigation({
  pathname,
  mobile = false,
}: {
  pathname: string;
  mobile?: boolean;
}) {
  return (
    <nav className="space-y-1" aria-label="Điều hướng quản trị">
      {adminNavigation.map((item) => {
        const Icon = item.icon;
        const active = isActiveRoute(pathname, item.href);
        const content = (
          <>
            <Icon className="size-4.5" />
            <span className="flex-1">{item.label}</span>
            {active && <ChevronRight className="size-4" />}
          </>
        );
        const className = cn(
          "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold transition-colors",
          mobile
            ? active
              ? "bg-rose-50 text-[#ff174f]"
              : "text-slate-600 hover:bg-slate-100"
            : active
              ? "bg-white/12 text-white"
              : "text-blue-100 hover:bg-white/8 hover:text-white",
        );

        if (mobile) {
          return (
            <SheetClose
              key={item.href}
              nativeButton={false}
              render={<Link href={item.href} />}
              className={className}
            >
              {content}
            </SheetClose>
          );
        }

        return (
          <Link
            key={item.href}
            href={item.href}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const currentItem =
    adminNavigation.find((item) =>
      isActiveRoute(pathname, item.href),
    ) ?? adminNavigation[0];

  function handleLogout() {
    signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <aside className="fixed inset-y-0 left-0 z-50 hidden h-screen w-72 flex-col overflow-y-auto bg-[#073b77] p-5 lg:flex">
        <AdminBrand />
        <Separator className="my-6 bg-white/12" />
        <AdminNavigation pathname={pathname} />

        <div className="mt-auto rounded-2xl bg-white/8 p-4">
          <p className="truncate text-sm font-bold text-white">
            {[user?.lastName, user?.firstName]
              .filter(Boolean)
              .join(" ")}
          </p>
          <p className="mt-1 truncate text-xs text-blue-200">
            {user?.email}
          </p>
          <Button
            type="button"
            onClick={handleLogout}
            variant="ghost"
            className="mt-4 h-10 w-full justify-start rounded-xl text-blue-100 hover:bg-white/10 hover:text-white"
          >
            <LogOut className="size-4" />
            Đăng xuất
          </Button>
        </div>
      </aside>

      <div className="min-w-0 lg:ml-72">
        <header className="sticky top-0 z-40 flex h-18 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    size="icon-lg"
                    className="lg:hidden"
                  />
                }
              >
                <Menu className="size-5" />
                <span className="sr-only">Mở menu quản trị</span>
              </SheetTrigger>
              <SheetContent side="left" className="w-[88%] max-w-sm">
                <SheetHeader className="bg-[#073b77] px-5 py-5 text-left">
                  <SheetTitle>
                    <AdminBrand />
                  </SheetTitle>
                  <SheetDescription className="text-blue-100">
                    Quản lý vận hành FieldMate.
                  </SheetDescription>
                </SheetHeader>
                <div className="px-3">
                  <AdminNavigation pathname={pathname} mobile />
                </div>
                <div className="mt-auto px-4 pb-4">
                  <Separator className="mb-4" />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleLogout}
                    className="h-11 w-full rounded-xl font-bold"
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-slate-400">
                Khu vực quản trị
              </p>
              <p className="font-extrabold text-[#073b77]">
                {currentItem.label}
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-700">
                {[user?.lastName, user?.firstName]
                  .filter(Boolean)
                  .join(" ")}
              </p>
              <p className="text-xs font-medium text-slate-400">
                Quản trị viên
              </p>
            </div>
            <Avatar
              size="lg"
              className="rounded-xl ring-2 ring-rose-100"
            >
              {user?.avatar && (
                <AvatarImage
                  src={user.avatar}
                  alt={[user.lastName, user.firstName]
                    .filter(Boolean)
                    .join(" ")}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="rounded-xl bg-rose-50 font-black text-[#ff174f]">
                {user?.firstName?.charAt(0).toUpperCase() ?? "A"}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="px-4 py-7 sm:px-6 lg:px-8 lg:py-9">
          <div className="mx-auto w-full max-w-[1440px]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
