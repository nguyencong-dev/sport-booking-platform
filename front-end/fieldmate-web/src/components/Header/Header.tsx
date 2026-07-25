"use client";

import Link from "next/link";
import {
  CalendarDays,
  House,
  MapPin,
  Menu,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";

const navigation = [
  { label: "Trang chủ", href: "/", icon: House },
  { label: "Sân tập", href: "/venues", icon: MapPin },
  { label: "Lịch đặt", href: "/bookings", icon: CalendarDays },
];

function Brand() {
  return (
    <img
      src="https://res.cloudinary.com/dxek6c0tg/image/upload/v1784977099/4d7ca5d8-bdb2-4fbf-b282-ad3c7194163b_sba6et.jpg"
      alt="FieldMate"
      className="h-14 w-auto max-w-[220px] object-contain"
    />
  );
}

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="FieldMate - Trang chủ">
          <Brand />
        </Link>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Điều hướng chính"
        >
          {navigation.map((item) => (
            <Button
              key={item.href}
              nativeButton={false}
              variant="ghost"
              size="lg"
              render={<Link href={item.href} />}
              className="px-4 font-semibold text-slate-600 hover:bg-rose-50 hover:text-[#ff174f]"
            >
              {item.label}
            </Button>
          ))}
        </nav>

        <div className="hidden items-center gap-1 lg:flex">
          <Button
            nativeButton={false}
            variant="ghost"
            size="lg"
            render={<Link href="/login" />}
          >
            Đăng nhập
          </Button>
          <Button
            nativeButton={false}
            size="lg"
            render={<Link href="/register" />}
            className="rounded-xl bg-[#ff174f] px-5 text-white shadow-md shadow-rose-500/20 hover:bg-[#e8003e]"
          >
            Đăng ký
          </Button>
        </div>

        <Sheet>
          <SheetTrigger
            render={
              <Button
                variant="outline"
                size="icon-lg"
                className="lg:hidden"
              />
            }
          >
            <Menu className="size-5" />
            <span className="sr-only">Mở menu</span>
          </SheetTrigger>

          <SheetContent side="right" className="w-[86%] max-w-sm">
            <SheetHeader className="border-b px-5 py-5">
              <SheetTitle>
                <Brand />
              </SheetTitle>
              <SheetDescription>
                Tìm và đặt sân thể thao thuận tiện.
              </SheetDescription>
            </SheetHeader>

            <nav className="flex flex-col gap-1 px-3" aria-label="Điều hướng di động">
              {navigation.map((item) => {
                const Icon = item.icon;

                return (
                  <SheetClose
                    key={item.href}
                    nativeButton={false}
                    render={<Link href={item.href} />}
                    className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-600 transition-colors hover:bg-rose-50 hover:text-[#ff174f]"
                  >
                    <Icon className="size-4.5" />
                    {item.label}
                  </SheetClose>
                );
              })}
            </nav>

            <div className="mt-auto px-4 pb-4">
              <Separator className="mb-4" />
              <div className="grid grid-cols-2 gap-2">
                <SheetClose
                  nativeButton={false}
                  render={<Link href="/login" />}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Đăng nhập
                </SheetClose>
                <SheetClose
                  nativeButton={false}
                  render={<Link href="/register" />}
                  className={buttonVariants({
                    className: "bg-[#ff174f] text-white hover:bg-[#e8003e]",
                  })}
                >
                  Đăng ký
                </SheetClose>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
