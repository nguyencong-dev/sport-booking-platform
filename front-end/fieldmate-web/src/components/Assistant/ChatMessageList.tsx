"use client";

import {
  Bot,
  BookOpenText,
  LoaderCircle,
  RotateCcw,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef } from "react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type {
  ChatMessageItem,
  ChatSourceResponse,
} from "@/types/chat";

type ChatMessageListProps = {
  messages: ChatMessageItem[];
  loading: boolean;
  userAvatar?: string | null;
  userName: string;
  userInitials: string;
  onRetry: (message: ChatMessageItem) => void;
  onOpenSources: (sources: ChatSourceResponse[]) => void;
};

export function ChatMessageList({
  messages,
  loading,
  userAvatar,
  userName,
  userInitials,
  onRetry,
  onOpenSources,
}: ChatMessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages]);

  if (loading) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto">
        <div className="flex items-center gap-3 font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-[#ff174f]" />
          Đang tải cuộc trò chuyện...
        </div>
      </div>
    );
  }

  if (messages.length === 0) {
    return <ChatWelcome />;
  }

  return (
    <div
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-6 sm:px-6"
      aria-live="polite"
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {messages.map((message) =>
          message.role === "user" ? (
            <UserMessage
              key={message.clientId}
              message={message}
              userAvatar={userAvatar}
              userName={userName}
              userInitials={userInitials}
              onRetry={onRetry}
            />
          ) : (
            <AssistantMessage
              key={message.clientId}
              message={message}
              onOpenSources={onOpenSources}
            />
          ),
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}

function ChatWelcome() {
  const suggestions = [
    "Tư vấn cách khởi động trước khi chơi thể thao",
    "Tôi nên chọn môn thể thao nào?",
    "Tìm sân cầu lông phù hợp với tôi",
  ];

  return (
    <div className="flex min-h-0 flex-1 items-center justify-center overflow-y-auto px-4 py-10 sm:px-6">
      <div className="w-full max-w-2xl text-center">
        <Image
          src="https://res.cloudinary.com/dxek6c0tg/image/upload/v1786614198/logo_chat_bot_yhjmmv.avif"
          alt="Trợ lý FieldMate"
          width={64}
          height={64}
          className="mx-auto size-16 rounded-3xl object-cover shadow-lg shadow-blue-950/15"
        />

        <h1 className="mt-6 text-3xl font-black tracking-[-0.04em] text-[#073b77] sm:text-4xl">
          Bạn muốn tìm hiểu điều gì?
        </h1>

        <p className="mx-auto mt-3 max-w-xl text-sm font-medium leading-7 text-slate-500 sm:text-base">
          Trợ lý FieldMate có thể tư vấn kiến thức thể thao, kỹ thuật,
          luật chơi và hỗ trợ bạn tìm sân phù hợp.
        </p>

        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion}
              className="rounded-2xl border border-slate-100 bg-white p-4 text-left text-sm font-semibold leading-6 text-slate-600 shadow-sm"
            >
              {suggestion}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function UserMessage({
  message,
  userAvatar,
  userName,
  userInitials,
  onRetry,
}: {
  message: ChatMessageItem;
  userAvatar?: string | null;
  userName: string;
  userInitials: string;
  onRetry: (message: ChatMessageItem) => void;
}) {
  return (
    <div className="flex justify-end gap-3">
      <div className="max-w-[82%] sm:max-w-[72%]">
        <div className="rounded-3xl rounded-tr-md bg-[#073b77] px-4 py-3 text-sm font-medium leading-6 whitespace-pre-wrap text-white shadow-sm">
          {message.content}
        </div>

        {message.status === "sending" && (
          <p className="mt-1.5 text-right text-[11px] font-medium text-slate-400">
            Đang gửi...
          </p>
        )}

        {message.status === "error" && (
          <div className="mt-2 flex items-center justify-end gap-2">
            <span className="text-xs font-semibold text-red-500">
              Gửi thất bại
            </span>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onRetry(message)}
              className="rounded-lg border-red-100 text-red-600 hover:bg-red-50"
            >
              <RotateCcw className="size-3.5" />
              Thử lại
            </Button>
          </div>
        )}
      </div>

      <Avatar className="size-9">
        {userAvatar && <AvatarImage src={userAvatar} alt={userName} />}
        <AvatarFallback className="bg-rose-50 text-xs font-black text-[#ff174f]">
          {userInitials}
        </AvatarFallback>
      </Avatar>
    </div>
  );
}

function AssistantMessage({
  message,
  onOpenSources,
}: {
  message: ChatMessageItem;
  onOpenSources: (sources: ChatSourceResponse[]) => void;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-2xl bg-[#ff174f] text-white shadow-sm shadow-rose-500/20">
        <Bot className="size-4.5" />
      </span>

      <div className="max-w-[86%] sm:max-w-[78%]">
        {message.status === "sending" ? (
          <div className="flex h-12 items-center gap-1.5 rounded-3xl rounded-tl-md border border-slate-100 bg-white px-5 shadow-sm">
            <span className="size-2 animate-bounce rounded-full bg-[#ff174f] [animation-delay:-0.3s]" />
            <span className="size-2 animate-bounce rounded-full bg-[#ff174f] [animation-delay:-0.15s]" />
            <span className="size-2 animate-bounce rounded-full bg-[#ff174f]" />
            <span className="ml-2 text-xs font-semibold text-slate-400">
              Đang suy nghĩ
            </span>
          </div>
        ) : (
          <div className="rounded-3xl rounded-tl-md border border-slate-100 bg-white px-5 py-4 text-sm font-medium leading-7 whitespace-pre-wrap text-slate-700 shadow-sm">
            {message.content}
          </div>
        )}

        {message.status === "sent" && message.sources.length > 0 && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onOpenSources(message.sources)}
            className="mt-2 rounded-lg px-2 text-xs font-bold text-[#073b77] hover:bg-blue-50"
          >
            <BookOpenText className="size-3.5" />
            {message.sources.length} nguồn tham khảo
          </Button>
        )}
      </div>
    </div>
  );
}
