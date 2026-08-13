"use client";

import Link from "next/link";
import {
  Archive,
  ArchiveRestore,
  Eye,
  FileText,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";

import { AdminEmpty, formatDateTime } from "@/components/Admin/AdminPage";
import { AiDocumentStatusBadge } from "@/components/AdminAiDocuments/AiDocumentStatusBadge";
import { Button } from "@/components/ui/button";
import type {
  KnowledgeDocumentAction,
  KnowledgeDocumentListItemResponse,
} from "@/types/knowledge-document";

type AiDocumentTableProps = {
  documents: KnowledgeDocumentListItemResponse[];
  busyDocumentId: number | null;
  onAction: (
    action: KnowledgeDocumentAction,
    document: KnowledgeDocumentListItemResponse,
  ) => void;
};

export function AiDocumentTable({
  documents,
  busyDocumentId,
  onAction,
}: AiDocumentTableProps) {
  if (documents.length === 0) {
    return <AdminEmpty label="Không có tài liệu phù hợp." />;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] text-left">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-5 py-4">Tài liệu</th>
            <th className="px-5 py-4">Trạng thái</th>
            <th className="px-5 py-4">Hoạt động</th>
            <th className="px-5 py-4">Đã lập chỉ mục</th>
            <th className="px-5 py-4">Ngày tạo</th>
            <th className="px-5 py-4 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((document) => {
            const busy = busyDocumentId === document.id;

            return (
              <tr key={document.id} className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-[#073b77]">
                      <FileText className="size-4.5" />
                    </span>
                    <div className="min-w-0">
                      <p className="max-w-72 truncate text-sm font-black text-slate-700">
                        {document.title}
                      </p>
                      <p className="mt-1 max-w-72 truncate text-xs font-medium text-slate-400">
                        {document.original_filename || `Tài liệu #${document.id}`}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4">
                  <AiDocumentStatusBadge status={document.status} />
                </td>
                <td className="px-5 py-4">
                  <span
                    className={`text-sm font-bold ${
                      document.is_active
                        ? "text-emerald-600"
                        : "text-slate-400"
                    }`}
                  >
                    {document.is_active ? "Đang dùng" : "Tạm ngừng"}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-500">
                  {formatDateTime(document.indexed_at)}
                </td>
                <td className="px-5 py-4 text-sm font-medium text-slate-500">
                  {formatDateTime(document.created_at)}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      nativeButton={false}
                      render={
                        <Link href={`/admin/ai-documents/${document.id}`} />
                      }
                      variant="outline"
                      size="icon-lg"
                      className="rounded-xl"
                    >
                      <Eye className="size-4" />
                      <span className="sr-only">Xem chi tiết</span>
                    </Button>

                    {document.status === "ready" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        disabled={busy}
                        onClick={() => onAction("reindex", document)}
                        className="rounded-xl"
                      >
                        {busy ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <RefreshCw className="size-4" />
                        )}
                        <span className="sr-only">Lập chỉ mục lại</span>
                      </Button>
                    )}

                    {document.status === "failed" && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        disabled={busy}
                        onClick={() => onAction("retry", document)}
                        className="rounded-xl text-amber-600"
                      >
                        {busy ? (
                          <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                          <RotateCcw className="size-4" />
                        )}
                        <span className="sr-only">Thử lại</span>
                      </Button>
                    )}

                    {(document.status === "ready" ||
                      document.status === "failed") && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon-lg"
                        disabled={busy}
                        onClick={() => onAction("archive", document)}
                        className="rounded-xl"
                      >
                        <Archive className="size-4" />
                        <span className="sr-only">Lưu trữ</span>
                      </Button>
                    )}

                    {document.status === "archived" && (
                      <>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon-lg"
                          disabled={busy}
                          onClick={() => onAction("restore", document)}
                          className="rounded-xl text-emerald-600"
                        >
                          <ArchiveRestore className="size-4" />
                          <span className="sr-only">Khôi phục</span>
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon-lg"
                          disabled={busy}
                          onClick={() =>
                            onAction("permanent-delete", document)
                          }
                          className="rounded-xl"
                        >
                          <Trash2 className="size-4" />
                          <span className="sr-only">Xóa vĩnh viễn</span>
                        </Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
