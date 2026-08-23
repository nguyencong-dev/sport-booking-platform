"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  LoaderCircle,
  RefreshCw,
  RotateCcw,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  AdminError,
  AdminLoading,
  AdminPageHeader,
} from "@/components/Admin/AdminPage";
import { AiDocumentActionDialog } from "@/components/AdminAiDocuments/AiDocumentActionDialog";
import { AiDocumentInformation } from "@/components/AdminAiDocuments/AiDocumentInformation";
import { IngestionJobList } from "@/components/AdminAiDocuments/IngestionJobList";
import { Button } from "@/components/ui/button";
import { knowledgeDocumentService } from "@/services/knowledge-document.service";
import type {
  KnowledgeDocumentAction,
  KnowledgeDocumentDetailResponse,
} from "@/types/knowledge-document";

type AiApiErrorResponse = {
  detail?: string;
};

function getRequestError(error: unknown, fallback: string) {
  if (axios.isAxiosError<AiApiErrorResponse>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

export function AdminAiDocumentDetailScreen({
  documentId,
}: {
  documentId: number;
}) {
  const router = useRouter();
  const [document, setDocument] = useState<KnowledgeDocumentDetailResponse | null>(null);
  const [selectedAction, setSelectedAction] = useState<KnowledgeDocumentAction | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDocument = useCallback(
    async (silent = false) => {
      try {
        if (silent) {
          setRefreshing(true);
        }

        const response = await knowledgeDocumentService.getById(documentId);
        setDocument(response);
        setError("");
      } catch (requestError) {
        setError(
          getRequestError(
            requestError,
            "Không thể tải chi tiết tài liệu AI.",
          ),
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [documentId],
  );

  useEffect(() => {
    let active = true;

    async function loadInitialDocument() {
      try {
        const response =
          await knowledgeDocumentService.getById(documentId);

        if (active) {
          setDocument(response);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          setError(
            getRequestError(
              requestError,
              "Không thể tải chi tiết tài liệu AI.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInitialDocument();

    return () => {
      active = false;
    };
  }, [documentId]);

  const processing =
    document?.status === "pending" || document?.status === "processing";

  useEffect(() => {
    if (!processing) {
      return;
    }

    const intervalId = window.setInterval(() => {
      void loadDocument(true);
    }, 4000);

    return () => window.clearInterval(intervalId);
  }, [loadDocument, processing]);

  async function handleConfirmAction() {
    if (!document || !selectedAction) {
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      setNotice("");

      if (selectedAction === "archive") {
        await knowledgeDocumentService.archive(document.id);
        setNotice("Đã lưu trữ tài liệu.");
      } else if (selectedAction === "restore") {
        await knowledgeDocumentService.restore(document.id);
        setNotice("Đã khôi phục tài liệu.");
      } else if (selectedAction === "permanent-delete") {
        await knowledgeDocumentService.permanentlyDelete(document.id);
        router.replace("/admin/ai-documents");
        return;
      } else if (selectedAction === "reindex") {
        const response = await knowledgeDocumentService.reindex(document.id);
        setNotice(response.message);
      } else {
        const response = await knowledgeDocumentService.retry(document.id);
        setNotice(response.message);
      }

      setSelectedAction(null);
      await loadDocument(true);
    } catch (requestError) {
      setError(
        getRequestError(requestError, "Không thể thực hiện thao tác."),
      );
    } finally {
      setSubmitting(false);
    }
  }

  function renderActions() {
    if (!document) {
      return null;
    }

    if (document.status === "pending" || document.status === "processing") {
      return (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <LoaderCircle className="size-4 animate-spin text-[#ff174f]" />
          Hệ thống đang xử lý tài liệu
        </div>
      );
    }

    if (document.status === "archived") {
      return (
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setSelectedAction("restore")}
            className="h-10 rounded-xl font-bold text-emerald-600"
          >
            <ArchiveRestore className="size-4" />
            Khôi phục
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={submitting}
            onClick={() => setSelectedAction("permanent-delete")}
            className="h-10 rounded-xl font-bold"
          >
            <Trash2 className="size-4" />
            Xóa vĩnh viễn
          </Button>
        </div>
      );
    }

    return (
      <div className="flex flex-wrap gap-2">
        {document.status === "ready" ? (
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setSelectedAction("reindex")}
            className="h-10 rounded-xl font-bold"
          >
            <RefreshCw className="size-4" />
            Lập chỉ mục lại
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={submitting}
            onClick={() => setSelectedAction("retry")}
            className="h-10 rounded-xl font-bold text-amber-600"
          >
            <RotateCcw className="size-4" />
            Thử lại
          </Button>
        )}
        <Button
          type="button"
          variant="outline"
          disabled={submitting}
          onClick={() => setSelectedAction("archive")}
          className="h-10 rounded-xl font-bold"
        >
          <Archive className="size-4" />
          Lưu trữ
        </Button>
      </div>
    );
  }

  return (
    <>
      <AdminPageHeader
        eyebrow="Dữ liệu trợ lý AI"
        title={document?.title || `Tài liệu #${documentId}`}
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon-lg"
              disabled={refreshing}
              onClick={() => void loadDocument(true)}
              className="rounded-xl"
            >
              <RefreshCw
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
              />
              <span className="sr-only">Làm mới</span>
            </Button>
            <Button
              nativeButton={false}
              render={<Link href="/admin/ai-documents" />}
              variant="outline"
              className="h-11 rounded-xl px-4 font-bold"
            >
              <ArrowLeft className="size-4" />
              Quay lại
            </Button>
          </div>
        }
      />

      <AdminError message={error} />

      {notice && (
        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {notice}
        </div>
      )}

      {loading ? (
        <section className="rounded-2xl border border-slate-200 bg-white">
          <AdminLoading label="Đang tải chi tiết tài liệu..." />
        </section>
      ) : document ? (
        <div className="space-y-5">
          <AiDocumentInformation document={document} />

          <section className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div>
              <h2 className="font-black text-[#073b77]">
                Thao tác tài liệu
              </h2>
            </div>
            {renderActions()}
          </section>

          <IngestionJobList jobs={document.ingestion_jobs} />
        </div>
      ) : null}

      <AiDocumentActionDialog
        action={selectedAction}
        document={document}
        loading={submitting}
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
