import { CircleAlert, Inbox, LoaderCircle } from "lucide-react";
import type { ReactNode } from "react";

import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type StatusTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "slate";

const statusStyles: Record<StatusTone, string> = {
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  red: "bg-red-100 text-red-700",
  blue: "bg-blue-100 text-blue-700",
  slate: "bg-slate-100 text-slate-600",
};

export function AdminPageHeader({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-[#ff174f]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] text-[#073b77]">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm font-medium text-slate-500">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

export function AdminError({ message }: { message: string }) {
  if (!message) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-6 bg-white p-4">
      <CircleAlert />
      <AlertTitle>Không thể thực hiện</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}

export function AdminLoading({ label = "Đang tải dữ liệu..." }) {
  return (
    <div className="flex min-h-64 items-center justify-center gap-3 font-semibold text-slate-500">
      <LoaderCircle className="size-6 animate-spin text-[#ff174f]" />
      {label}
    </div>
  );
}

export function AdminEmpty({ label }: { label: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
      <span className="grid size-12 place-items-center rounded-2xl bg-slate-100">
        <Inbox className="size-5" />
      </span>
      <p className="font-semibold">{label}</p>
    </div>
  );
}

export function AdminStatusBadge({
  label,
  tone,
}: {
  label: string;
  tone: StatusTone;
}) {
  return (
    <Badge
      variant="secondary"
      className={`h-7 rounded-full border-0 px-3 font-bold ${statusStyles[tone]}`}
    >
      {label}
    </Badge>
  );
}

export function formatDateTime(value: string | null | undefined) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);
}
