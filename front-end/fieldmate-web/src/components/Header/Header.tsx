"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Building2,
  CalendarDays,
  ChevronDown,
  House,
  LogOut,
  MapPin,
  Menu,
  UserRound,
} from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { useAuth } from "@/contexts/AuthContext";

const publicNavigation = [
  { label: "Trang chủ", href: "/", icon: House },
  { label: "Sân tập", href: "/venues", icon: MapPin },
  { label: "Lịch đặt", href: "/bookings", icon: CalendarDays },
];

const courtOwnerNavigation = [
  {
    label: "Quản lý sân tập",
    href: "/my-venues",
    icon: Building2,
  },
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
  const router = useRouter();
  const { user, isAuthenticated, ready, signOut } = useAuth();

  const fullName = user
    ? [user.lastName, user.firstName].filter(Boolean).join(" ")
    : "";
  const initials = user
    ? `${user.lastName?.charAt(0) ?? ""}${user.firstName?.charAt(0) ?? ""}`.toUpperCase()
    : "FM";

  function handleLogout() {
    signOut();
    router.replace("/");
    router.refresh();
  }

  function handleProfile() {
    router.push("/profile");
  }

  const navigation =
    user?.role === "COURT_OWNER"
      ? courtOwnerNavigation
      : publicNavigation;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 shadow-[0_4px_24px_rgba(15,23,42,0.04)] backdrop-blur-md">
      <div className="mx-auto flex h-20 w-full max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="FieldMate - Trang chủ">
          <Brand />
        </Link>

        <nav
          className="ml-8 mr-auto hidden items-center gap-1 lg:flex"
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
          {ready && isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    className="h-auto gap-3 rounded-xl px-2 py-1.5 hover:bg-rose-50"
                  />
                }
              >
                <Avatar size="lg">
                  {user.avatar && (
                    <AvatarImage src={user.avatar} alt={fullName} />
                  )}
                  <AvatarFallback className="bg-[#073b77] font-bold text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="max-w-40 truncate font-semibold text-slate-700">
                  {fullName}
                </span>
                <ChevronDown className="size-4 text-slate-400" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="w-64 rounded-xl p-2"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2 py-2">
                    <span className="block truncate font-bold text-slate-800">
                      {fullName}
                    </span>
                    <span className="mt-0.5 block truncate font-normal text-slate-500">
                      {user.email}
                    </span>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleProfile}
                  className="cursor-pointer gap-2 rounded-lg px-2 py-2.5"
                >
                  <UserRound className="size-4" />
                  Xem thông tin cá nhân
                </DropdownMenuItem>
                <DropdownMenuItem
                  variant="destructive"
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 rounded-lg px-2 py-2.5"
                >
                  <LogOut className="size-4" />
                  Đăng xuất
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
            </>
          )}
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
              {ready && isAuthenticated ? (
                <div className="space-y-3">
                  {user && (
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Avatar size="lg">
                        {user.avatar && (
                          <AvatarImage src={user.avatar} alt={fullName} />
                        )}
                        <AvatarFallback className="bg-[#073b77] font-bold text-white">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {fullName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  )}
                  <SheetClose
                    nativeButton={false}
                    render={<Link href="/profile" />}
                    className={buttonVariants({
                      variant: "outline",
                      className: "h-10 w-full",
                    })}
                  >
                    <UserRound className="size-4" />
                    Xem thông tin cá nhân
                  </SheetClose>
                  <SheetClose
                    type="button"
                    onClick={handleLogout}
                    className={buttonVariants({
                      className:
                        "h-10 w-full bg-[#ff174f] text-white hover:bg-[#e8003e]",
                    })}
                  >
                    <LogOut className="size-4" />
                    Đăng xuất
                  </SheetClose>
                </div>
              ) : (
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
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
