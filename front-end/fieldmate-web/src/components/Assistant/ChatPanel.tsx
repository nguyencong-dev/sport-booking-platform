"use client";

import { ChatComposer } from "@/components/Assistant/ChatComposer";
import { ChatMessageList } from "@/components/Assistant/ChatMessageList";
import { SidebarTrigger } from "@/components/ui/sidebar";
import type {
  ChatMessageItem,
  ChatSourceResponse,
} from "@/types/chat";

type ChatPanelProps = {
  userAvatar?: string | null;
  userName: string;
  userInitials: string;
  messages: ChatMessageItem[];
  loading: boolean;
  sending: boolean;
  error: string;
  onSend: (message: string) => void;
  onRetry: (message: ChatMessageItem) => void;
  onOpenSources: (sources: ChatSourceResponse[]) => void;
};

export function ChatPanel({
  userAvatar,
  userName,
  userInitials,
  messages,
  loading,
  sending,
  error,
  onSend,
  onRetry,
  onOpenSources,
}: ChatPanelProps) {
  return (
    <section className="flex h-[calc(100svh-5rem)] min-h-0 w-full flex-none flex-col overflow-hidden">
      <header className="flex h-14 shrink-0 items-center border-b border-slate-100 bg-white px-4">
        <SidebarTrigger className="size-9 rounded-xl text-slate-500 hover:bg-rose-50 hover:text-[#ff174f]" />
      </header>

      {error && (
        <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-center text-xs font-semibold text-red-600">
          {error}
        </div>
      )}

      <ChatMessageList
        messages={messages}
        loading={loading}
        userAvatar={userAvatar}
        userName={userName}
        userInitials={userInitials}
        onRetry={onRetry}
        onOpenSources={onOpenSources}
      />

      <ChatComposer disabled={sending || loading} onSend={onSend} />
    </section>
  );
}
