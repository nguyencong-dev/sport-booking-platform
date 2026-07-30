"use client";

import { AlertDialog as AlertDialogPrimitive } from "@base-ui/react/alert-dialog";
import {
  CircleAlert,
  LoaderCircle,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

type ConfirmationDialogVariant =
  | "default"
  | "destructive"
  | "success"
  | "warning";

type ConfirmationDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  variant?: ConfirmationDialogVariant;
  icon?: LucideIcon;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

const variantStyles: Record<
  ConfirmationDialogVariant,
  {
    icon: string;
    button: string;
  }
> = {
  default: {
    icon: "bg-blue-50 text-[#246bfe]",
    button: "bg-[#073b77] text-white hover:bg-[#052d5c]",
  },
  destructive: {
    icon: "bg-red-50 text-red-600",
    button: "bg-red-600 text-white hover:bg-red-700",
  },
  success: {
    icon: "bg-emerald-50 text-emerald-600",
    button: "bg-emerald-600 text-white hover:bg-emerald-700",
  },
  warning: {
    icon: "bg-amber-50 text-amber-600",
    button: "bg-amber-500 text-white hover:bg-amber-600",
  },
};

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Xác nhận",
  cancelLabel = "Hủy",
  loading = false,
  variant = "default",
  icon: Icon = CircleAlert,
  onOpenChange,
  onConfirm,
}: ConfirmationDialogProps) {
  const styles = variantStyles[variant];

  return (
    <AlertDialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!loading) {
          onOpenChange(nextOpen);
        }
      }}
    >
      <AlertDialogPrimitive.Portal>
        <AlertDialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-[2px] transition-opacity duration-200 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <AlertDialogPrimitive.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <AlertDialogPrimitive.Popup className="w-full max-w-md rounded-3xl border border-white/70 bg-white p-6 shadow-2xl outline-none transition duration-200 data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 sm:p-7">
            <div
              className={`grid size-14 place-items-center rounded-2xl ${styles.icon}`}
            >
              <Icon className="size-6" />
            </div>

            <AlertDialogPrimitive.Title className="mt-5 text-xl font-black tracking-[-0.02em] text-[#073b77]">
              {title}
            </AlertDialogPrimitive.Title>

            <AlertDialogPrimitive.Description className="mt-2 text-sm font-medium leading-6 text-slate-500">
              {description}
            </AlertDialogPrimitive.Description>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <AlertDialogPrimitive.Close
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    className="h-11 rounded-xl px-5 font-bold"
                  />
                }
              >
                {cancelLabel}
              </AlertDialogPrimitive.Close>

              <Button
                type="button"
                disabled={loading}
                onClick={() => void onConfirm()}
                className={`h-11 rounded-xl px-5 font-bold ${styles.button}`}
              >
                {loading && (
                  <LoaderCircle className="size-4 animate-spin" />
                )}
                {confirmLabel}
              </Button>
            </div>
          </AlertDialogPrimitive.Popup>
        </AlertDialogPrimitive.Viewport>
      </AlertDialogPrimitive.Portal>
    </AlertDialogPrimitive.Root>
  );
}
