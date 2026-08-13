"use client";

import { usePathname } from "next/navigation";

import { Footer } from "@/components/Footer/Footer";

const compactRoutePrefixes = [
  "/my-venues",
  "/owner-bookings",
  "/payment-accounts",
];

export function AppFooter() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/assistant") {
    return null;
  }

  const compact = compactRoutePrefixes.some(
    (prefix) =>
      pathname === prefix || pathname.startsWith(`${prefix}/`),
  );

  return <Footer variant={compact ? "compact" : "public"} />;
}
