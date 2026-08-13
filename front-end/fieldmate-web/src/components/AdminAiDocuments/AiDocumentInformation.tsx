import { FileText, Layers3 } from "lucide-react";

import { formatDateTime } from "@/components/Admin/AdminPage";
import { AiDocumentStatusBadge } from "@/components/AdminAiDocuments/AiDocumentStatusBadge";
import type { KnowledgeDocumentDetailResponse } from "@/types/knowledge-document";

export function AiDocumentInformation({
  document,
}: {
  document: KnowledgeDocumentDetailResponse;
}) {
  const information = [
    ["Mã tài liệu", `#${document.id}`],
    ["Tên file gốc", document.original_filename || "—"],
    ["Số lượng chunk", document.chunk_count.toLocaleString("vi-VN")],
    ["Ngày tạo", formatDateTime(document.created_at)],
    ["Cập nhật lần cuối", formatDateTime(document.updated_at)],
    ["Lập chỉ mục", formatDateTime(document.indexed_at)],
  ];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-blue-50 text-[#073b77]">
            <FileText className="size-5" />
          </span>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-black text-[#073b77]">
              {document.title}
            </h2>
            <p className="mt-1 truncate text-sm font-medium text-slate-500">
              {document.original_filename || "Không có tên file gốc"}
            </p>
          </div>
        </div>
        <AiDocumentStatusBadge status={document.status} />
      </div>

      <dl className="grid gap-px bg-slate-100 sm:grid-cols-2 xl:grid-cols-3">
        {information.map(([label, value]) => (
          <div key={label} className="bg-white p-5">
            <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {label}
            </dt>
            <dd className="mt-2 break-words text-sm font-bold text-slate-700">
              {value}
            </dd>
          </div>
        ))}
      </dl>

      {document.description && (
        <div className="border-t border-slate-100 p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Mô tả
          </p>
          <p className="mt-2 text-sm font-medium leading-6 text-slate-600">
            {document.description}
          </p>
        </div>
      )}

      <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500">
        <Layers3 className="size-4 text-[#073b77]" />
        {document.is_active
          ? "Tài liệu đang được sử dụng trong kho tri thức."
          : "Tài liệu hiện không được sử dụng để trả lời người dùng."}
      </div>
    </section>
  );
}
