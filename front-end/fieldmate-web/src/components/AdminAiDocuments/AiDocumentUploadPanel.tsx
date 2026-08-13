"use client";

import { FileUp, LoaderCircle, X } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import type { KnowledgeDocumentUploadRequest } from "@/types/knowledge-document";

type AiDocumentUploadPanelProps = {
  open: boolean;
  uploading: boolean;
  onClose: () => void;
  onUpload: (request: KnowledgeDocumentUploadRequest) => Promise<boolean>;
};

export function AiDocumentUploadPanel({
  open,
  uploading,
  onClose,
  onUpload,
}: AiDocumentUploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [validationError, setValidationError] = useState("");

  if (!open) {
    return null;
  }

  function resetForm() {
    setFile(null);
    setTitle("");
    setValidationError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  function handleClose() {
    if (uploading) {
      return;
    }

    resetForm();
    onClose();
  }

  function handleFileChange(nextFile: File | null) {
    if (!nextFile) {
      setFile(null);
      return;
    }

    if (
      nextFile.type !== "application/pdf" &&
      !nextFile.name.toLowerCase().endsWith(".pdf")
    ) {
      setFile(null);
      setValidationError("Chỉ chấp nhận tài liệu PDF.");
      return;
    }

    setFile(nextFile);
    setValidationError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setValidationError("Vui lòng chọn một tài liệu PDF.");
      return;
    }

    const uploaded = await onUpload({
      file,
      title: title.trim() || undefined,
    });

    if (uploaded) {
      resetForm();
      onClose();
    }
  }

  return (
    <section className="mb-6 rounded-2xl border border-rose-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-black text-[#073b77]">
            Tải tài liệu kiến thức
          </h2>
        </div>
        <Button
          type="button"
          size="icon-lg"
          variant="ghost"
          disabled={uploading}
          onClick={handleClose}
          className="rounded-xl"
        >
          <X className="size-4" />
          <span className="sr-only">Đóng biểu mẫu tải tài liệu</span>
        </Button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-5 grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end"
      >
        <label className="text-sm font-bold text-slate-700">
          Tệp PDF
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,.pdf"
            disabled={uploading}
            onChange={(event) =>
              handleFileChange(event.target.files?.[0] ?? null)
            }
            className="mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium file:mr-3 file:rounded-lg file:border-0 file:bg-rose-50 file:px-3 file:py-1 file:font-bold file:text-[#ff174f] disabled:opacity-60"
          />
        </label>

        <label className="text-sm font-bold text-slate-700">
          Tiêu đề tùy chọn
          <input
            type="text"
            value={title}
            maxLength={255}
            disabled={uploading}
            placeholder={file?.name || "Mặc định dùng tên file"}
            onChange={(event) => setTitle(event.target.value)}
            className="mt-2 block h-11 w-full rounded-xl border border-slate-200 px-4 text-sm font-medium outline-none focus:border-[#ff174f] focus:ring-3 focus:ring-rose-100 disabled:opacity-60"
          />
        </label>

        <Button
          type="submit"
          disabled={uploading || !file}
          className="h-11 rounded-xl bg-[#ff174f] px-5 font-bold text-white hover:bg-[#e8003e]"
        >
          {uploading ? (
            <LoaderCircle className="size-4 animate-spin" />
          ) : (
            <FileUp className="size-4" />
          )}
          {uploading ? "Đang tải lên" : "Tải lên"}
        </Button>
      </form>

      {validationError && (
        <p className="mt-3 text-sm font-semibold text-red-600">
          {validationError}
        </p>
      )}
    </section>
  );
}
