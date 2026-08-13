"use client";

import {
  Archive,
  ArchiveRestore,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import type {
  KnowledgeDocumentAction,
  KnowledgeDocumentListItemResponse,
} from "@/types/knowledge-document";

const actionConfig = {
  archive: {
    title: "Lưu trữ tài liệu?",
    description: "Tài liệu sẽ ngừng được sử dụng để trả lời người dùng.",
    confirmLabel: "Lưu trữ",
    variant: "warning" as const,
    icon: Archive,
  },
  restore: {
    title: "Khôi phục tài liệu?",
    description: "Tài liệu sẽ được kích hoạt lại trong kho tri thức AI.",
    confirmLabel: "Khôi phục",
    variant: "success" as const,
    icon: ArchiveRestore,
  },
  "permanent-delete": {
    title: "Xóa vĩnh viễn tài liệu?",
    description:
      "File PDF, dữ liệu chỉ mục và lịch sử xử lý sẽ bị xóa, không thể khôi phục.",
    confirmLabel: "Xóa vĩnh viễn",
    variant: "destructive" as const,
    icon: Trash2,
  },
  reindex: {
    title: "Lập chỉ mục lại?",
    description:
      "Dữ liệu chỉ mục hiện tại sẽ được tạo lại từ file PDF gốc.",
    confirmLabel: "Lập chỉ mục lại",
    variant: "default" as const,
    icon: RefreshCw,
  },
  retry: {
    title: "Thử xử lý lại?",
    description:
      "Tài liệu thất bại sẽ được đưa lại vào hàng đợi xử lý.",
    confirmLabel: "Thử lại",
    variant: "default" as const,
    icon: RotateCcw,
  },
};

type AiDocumentActionDialogProps = {
  action: KnowledgeDocumentAction | null;
  document: KnowledgeDocumentListItemResponse | null;
  loading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void | Promise<void>;
};

export function AiDocumentActionDialog({
  action,
  document,
  loading,
  onOpenChange,
  onConfirm,
}: AiDocumentActionDialogProps) {
  const config = action ? actionConfig[action] : null;

  return (
    <ConfirmationDialog
      open={Boolean(action && document)}
      title={config?.title ?? "Xác nhận thao tác"}
      description={
        document && config
          ? `${config.description} Tài liệu: “${document.title}”.`
          : ""
      }
      confirmLabel={config?.confirmLabel}
      loading={loading}
      variant={config?.variant}
      icon={config?.icon}
      onOpenChange={onOpenChange}
      onConfirm={onConfirm}
    />
  );
}
