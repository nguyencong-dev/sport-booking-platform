import { AdminStatusBadge } from "@/components/Admin/AdminPage";
import type {
  IngestionJobStatus,
  KnowledgeDocumentStatus,
} from "@/types/knowledge-document";

const documentStatusConfig: Record<
  KnowledgeDocumentStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue" | "slate";
  }
> = {
  pending: { label: "Đang chờ", tone: "amber" },
  processing: { label: "Đang xử lý", tone: "blue" },
  ready: { label: "Sẵn sàng", tone: "green" },
  failed: { label: "Thất bại", tone: "red" },
  archived: { label: "Đã lưu trữ", tone: "slate" },
};

const jobStatusConfig: Record<
  IngestionJobStatus,
  {
    label: string;
    tone: "green" | "amber" | "red" | "blue" | "slate";
  }
> = {
  pending: { label: "Đang chờ", tone: "amber" },
  processing: { label: "Đang xử lý", tone: "blue" },
  completed: { label: "Hoàn thành", tone: "green" },
  failed: { label: "Thất bại", tone: "red" },
};

export function AiDocumentStatusBadge({
  status,
}: {
  status: KnowledgeDocumentStatus;
}) {
  const config = documentStatusConfig[status];

  return <AdminStatusBadge label={config.label} tone={config.tone} />;
}

export function IngestionJobStatusBadge({
  status,
}: {
  status: IngestionJobStatus;
}) {
  const config = jobStatusConfig[status];

  return <AdminStatusBadge label={config.label} tone={config.tone} />;
}

export { documentStatusConfig };
