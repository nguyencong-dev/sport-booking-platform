"use client";

import { SendHorizontal } from "lucide-react";
import { useState, type FormEvent, type KeyboardEvent } from "react";

import { Button } from "@/components/ui/button";

type ChatComposerProps = {
  disabled?: boolean;
  onSend: (message: string) => void;
};

const MAX_MESSAGE_LENGTH = 4000;

export function ChatComposer({
  disabled = false,
  onSend,
}: ChatComposerProps) {
  const [draft, setDraft] = useState("");
  const cleanedDraft = draft.trim();
  const canSend = Boolean(cleanedDraft) && !disabled;

  function submitMessage() {
    if (!canSend) {
      return;
    }

    onSend(cleanedDraft);
    setDraft("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitMessage();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();
      submitMessage();
    }
  }

  return (
    <div className="z-10 shrink-0 border-t border-slate-100 bg-white px-4 py-4 sm:px-6">
      <form
        onSubmit={handleSubmit}
        className="mx-auto w-full max-w-4xl"
      >
        <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-[0_8px_30px_rgba(15,23,42,0.07)] transition focus-within:border-rose-300 focus-within:ring-4 focus-within:ring-rose-50">
          <label htmlFor="assistant-message" className="sr-only">
            Nhập câu hỏi cho trợ lý FieldMate
          </label>

          <textarea
            id="assistant-message"
            value={draft}
            maxLength={MAX_MESSAGE_LENGTH}
            rows={1}
            disabled={disabled}
            placeholder="Hỏi về luật chơi, kỹ thuật, tập luyện hoặc tìm sân..."
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm font-medium leading-6 text-slate-700 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <Button
            type="submit"
            size="icon-lg"
            disabled={!canSend}
            className="mb-1 shrink-0 rounded-xl bg-[#ff174f] text-white hover:bg-[#e8003e]"
          >
            <SendHorizontal className="size-4.5" />
            <span className="sr-only">Gửi câu hỏi</span>
          </Button>
        </div>

        <div className="mt-2 flex items-center justify-between px-1 text-[11px] font-medium text-slate-400">
          <span>Enter để gửi, Shift + Enter để xuống dòng</span>
          <span>
            {draft.length}/{MAX_MESSAGE_LENGTH}
          </span>
        </div>
      </form>
    </div>
  );
}
