"use client";

import { BookOpenText, FileText } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { ChatSourceResponse } from "@/types/chat";

type ChatSourceSheetProps = {
  open: boolean;
  sources: ChatSourceResponse[];
  onOpenChange: (open: boolean) => void;
};

export function ChatSourceSheet({
  open,
  sources,
  onOpenChange,
}: ChatSourceSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[92%] max-w-md gap-0 bg-white">
        <SheetHeader className="border-b border-slate-100 px-6 py-5">
          <div className="mb-3 grid size-11 place-items-center rounded-2xl bg-rose-50 text-[#ff174f]">
            <BookOpenText className="size-5" />
          </div>
          <SheetTitle className="text-xl font-black text-[#073b77]">
            Nguồn tham khảo
          </SheetTitle>
          <SheetDescription className="mt-1 leading-6">
            Các tài liệu được sử dụng để tạo câu trả lời này.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          {sources.map((source, index) => (
            <article
              key={source.chunk_id}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
            >
              <div className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-white text-[#073b77] shadow-sm">
                  <FileText className="size-4" />
                </span>

                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#ff174f]">
                    Nguồn {index + 1}
                  </p>
                  <h3 className="mt-1 break-words text-sm font-bold leading-6 text-slate-800">
                    {source.document_title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-slate-500">
                    {source.page_number
                      ? `Trang ${source.page_number}`
                      : "Không xác định trang"}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
