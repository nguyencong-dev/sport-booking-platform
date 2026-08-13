"use client";

import axios from "axios";
import {
  Archive,
  CheckCircle2,
  CircleAlert,
  Clock3,
  FileText,
  FileUp,
  RefreshCw,
  Search,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { AiDocumentActionDialog } from "@/components/AdminAiDocuments/AiDocumentActionDialog";
import { AiDocumentTable } from "@/components/AdminAiDocuments/AiDocumentTable";
import { AiDocumentUploadPanel } from "@/components/AdminAiDocuments/AiDocumentUploadPanel";
import { Button } from "@/components/ui/button";
import { knowledgeDocumentService } from "@/services/knowledge-document.service";
import type {
  KnowledgeDocumentAction,
  KnowledgeDocumentListItemResponse,
  KnowledgeDocumentStatus,
  KnowledgeDocumentUploadRequest,
} from "@/types/knowledge-document";

type AiApiErrorResponse = {
  detail?: string;
};

type SelectedAction = {
  type: KnowledgeDocumentAction;
  document: KnowledgeDocumentListItemResponse;
} | null;

const statusOptions: Array<{
  value: "all" | KnowledgeDocumentStatus;
  label: string;
}> = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "pending", label: "Đang chờ" },
  { value: "processing", label: "Đang xử lý" },
  { value: "ready", label: "Sẵn sàng" },
  { value: "failed", label: "Thất bại" },
  { value: "archived", label: "Đã lưu trữ" },
];

function getRequestError(error: unknown, fallback: string) {
  if (axios.isAxiosError<AiApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

export function AdminAiDocumentsScreen() {
  const [documents, setDocuments] = useState<
    KnowledgeDocumentListItemResponse[]
  >([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | KnowledgeDocumentStatus
  >("all");
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedAction, setSelectedAction] =
    useState<SelectedAction>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [busyDocumentId, setBusyDocumentId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDocuments = useCallback(async (silent = false) => {
    try {
      if (silent) {
        setRefreshing(true);
      }

      const response = await knowledgeDocumentService.getAll();
      setDocuments(response);
      setError("");
    } catch (requestError) {
      setError(
        getRequestError(
          requestError,
          "Không thể tải danh sách tài liệu AI.",
        ),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialDocuments() {
      try {
        const response = await knowledgeDocumentService.getAll();

        if (active) {
          setDocuments(response);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError(
            getRequestError(
              requestError,
              "Không thể tải danh sách tài liệu AI.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialDocuments();

    return () => {
      active = false;
    };
  }, []);

  const hasProcessingDocument = documents.some(
    (document) =>
      document.status === "pending" ||
      document.status === "processing",
  );

  useEffect(() => {
    if (!hasProcessingDocument) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadDocuments(true);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [hasProcessingDocument, loadDocuments]);

  const filteredDocuments = useMemo(() => {
    const keyword = search.trim().toLocaleLowerCase("vi-VN");

    return documents.filter((document) => {
      const matchesStatus =
        statusFilter === "all" || document.status === statusFilter;
      const matchesSearch =
        !keyword ||
        document.title.toLocaleLowerCase("vi-VN").includes(keyword) ||
        document.original_filename
          ?.toLocaleLowerCase("vi-VN")
          .includes(keyword);

      return matchesStatus && Boolean(matchesSearch);
    });
  }, [documents, search, statusFilter]);

  const statistics = [
    {
      label: "Tổng tài liệu",
      value: documents.length,
      icon: FileText,
      style: "bg-blue-50 text-[#073b77]",
    },
    {
      label: "Đang hoạt động",
      value: documents.filter((document) => document.is_active).length,
      icon: CheckCircle2,
      style: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Đang xử lý",
      value: documents.filter(
        (document) =>
          document.status === "pending" ||
          document.status === "processing",
      ).length,
      icon: Clock3,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Cần xử lý",
      value: documents.filter((document) => document.status === "failed")
        .length,
      icon: CircleAlert,
      style: "bg-red-50 text-red-600",
    },
    {
      label: "Đã lưu trữ",
      value: documents.filter(
        (document) => document.status === "archived",
      ).length,
      icon: Archive,
      style: "bg-slate-100 text-slate-600",
    },
  ];

  async function handleUpload(
    request: KnowledgeDocumentUploadRequest,
  ) {
    try {
      setUploading(true);
      setError("");
      const response = await knowledgeDocumentService.upload(request);
      setNotice(response.message);
      await loadDocuments(true);
      return true;
    } catch (requestError) {
      setError(
        getRequestError(requestError, "Không thể tải tài liệu lên."),
      );
      return false;
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirmAction() {
    if (!selectedAction) {
      return;
    }

    const { type, document } = selectedAction;

    try {
      setBusyDocumentId(document.id);
      setError("");
      setNotice("");

      if (type === "archive") {
        await knowledgeDocumentService.archive(document.id);
        setNotice("Đã lưu trữ tài liệu.");
      } else if (type === "restore") {
        await knowledgeDocumentService.restore(document.id);
        setNotice("Đã khôi phục tài liệu.");
      } else if (type === "permanent-delete") {
        await knowledgeDocumentService.permanentlyDelete(document.id);
        setNotice("Đã xóa vĩnh viễn tài liệu.");
      } else if (type === "reindex") {
        const response = await knowledgeDocumentService.reindex(
          document.id,
        );
        setNotice(response.message);
      } else {
        const response = await knowledgeDocumentService.retry(document.id);
        setNotice(response.message);
      }

      setSelectedAction(null);
      await loadDocuments(true);
    } catch (requestError) {
      setError(
        getRequestError(requestError, "Không thể thực hiện thao tác."),
      );
    } finally {
      setBusyDocumentId(null);
    }
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Dữ liệu trợ lý AI"
        title="Kho tri thức AI"
        action={
          <Button
            type="button"
            onClick={() => setUploadOpen((current) => !current)}
            className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white hover:bg-[#e8003e]"
          >
            <FileUp className="size-4" />
            Tải tài liệu
          </Button>
        }
      />

      <AdminError message={error} />

      {notice && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      <AiDocumentUploadPanel
        open={uploadOpen}
        uploading={uploading}
        onClose={() => setUploadOpen(false)}
        onUpload={handleUpload}
      />

      <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {statistics.map((statistic) => {
          const Icon = statistic.icon;

          return (
            <article
              key={statistic.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    {statistic.label}
                  </p>
                  <p className="mt-2 text-2xl font-black text-[#073b77]">
                    {statistic.value}
                  </p>
                </div>
                <span
                  className={`grid size-11 place-items-center rounded-2xl ${statistic.style}`}
                >
                  <Icon className="size-5" />
                </span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <label className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <span className="sr-only">Tìm tài liệu</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tìm theo tiêu đề hoặc tên file..."
              className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-4 text-sm font-medium outline-none focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100"
            />
          </label>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as "all" | KnowledgeDocumentStatus,
              )
            }
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 outline-none focus:border-[#ff174f]"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <Button
            type="button"
            variant="outline"
            size="icon-lg"
            disabled={refreshing}
            onClick={() => void loadDocuments(true)}
            className="rounded-xl"
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            />
            <span className="sr-only">Làm mới danh sách</span>
          </Button>
        </div>

        {loading ? (
          <AdminLoading label="Đang tải kho tri thức..." />
        ) : (
          <AiDocumentTable
            documents={filteredDocuments}
            busyDocumentId={busyDocumentId}
            onAction={(type, document) =>
              setSelectedAction({ type, document })
            }
          />
        )}
      </section>

      <AiDocumentActionDialog
        action={selectedAction?.type ?? null}
        document={selectedAction?.document ?? null}
        loading={busyDocumentId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedAction(null);
          }
        }}
        onConfirm={handleConfirmAction}
      />
    </>
  );
}
