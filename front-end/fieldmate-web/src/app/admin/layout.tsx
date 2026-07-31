import type { ReactNode } from "react";

import { AdminGuard } from "@/components/Admin/AdminGuard";
import { AdminShell } from "@/components/Admin/AdminShell";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <AdminGuard>
      <AdminShell>{children}</AdminShell>
    </AdminGuard>
  );
}
