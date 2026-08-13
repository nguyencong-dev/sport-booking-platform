"use client";

import {
  History,
  MessageSquareText,
  Plus,
  Trash2,
} from "lucide-react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import type { ConversationListItemResponse } from "@/types/conversation";

type AssistantSidebarProps = {
  conversations: ConversationListItemResponse[];
  selectedConversationId?: number;
  loading: boolean;
  onSelect: (conversationId: number) => void;
  onCreateNew: () => void;
  onRequestDelete: (conversationId: number) => void;
};

function formatConversationDate(value: string) {
  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  }).format(new Date(value));
}

export function AssistantSidebar({
  conversations,
  selectedConversationId,
  loading,
  onSelect,
  onCreateNew,
  onRequestDelete,
}: AssistantSidebarProps) {
  const { isMobile, setOpenMobile } = useSidebar();

  function closeMobileSidebar() {
    if (isMobile) {
      setOpenMobile(false);
    }
  }

  function handleCreateNew() {
    onCreateNew();
    closeMobileSidebar();
  }

  function handleSelect(conversationId: number) {
    onSelect(conversationId);
    closeMobileSidebar();
  }

  return (
    <Sidebar
      collapsible="offcanvas"
      className="top-20 h-[calc(100svh-5rem)] border-r border-slate-200"
    >
      <SidebarHeader className="gap-4 border-b border-slate-100 p-4">
        <div className="flex items-center gap-3 px-1">
          <Image
            src="https://res.cloudinary.com/dxek6c0tg/image/upload/v1786614198/logo_chat_bot_yhjmmv.avif"
            alt="Trợ lý FieldMate"
            width={40}
            height={40}
            className="size-10 rounded-2xl object-cover shadow-sm"
          />

          <div className="min-w-0">
            <p className="font-black tracking-[-0.02em] text-[#073b77]">
              Trợ lý FieldMate
            </p>
            <p className="truncate text-xs font-medium text-slate-500">
              Tư vấn thể thao
            </p>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleCreateNew}
          className="h-11 w-full rounded-xl bg-[#ff174f] font-bold text-white shadow-sm shadow-rose-500/20 hover:bg-[#e8003e]"
        >
          <Plus className="size-4" />
          Trò chuyện mới
        </Button>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup className="p-3">
          <SidebarGroupLabel className="gap-2 px-2 font-bold text-slate-500">
            <History className="size-4" />
            Lịch sử trò chuyện
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {loading ? (
                Array.from({ length: 5 }, (_, index) => (
                  <SidebarMenuSkeleton
                    key={index}
                    showIcon
                    className="h-11"
                  />
                ))
              ) : conversations.length === 0 ? (
                <div className="px-3 py-8 text-center">
                  <MessageSquareText className="mx-auto size-8 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-500">
                    Chưa có cuộc trò chuyện
                  </p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      type="button"
                      size="lg"
                      isActive={
                        selectedConversationId === conversation.id
                      }
                      tooltip={conversation.title}
                      onClick={() => handleSelect(conversation.id)}
                      className="h-12 rounded-xl px-3 data-active:bg-rose-50 data-active:text-[#ff174f]"
                    >
                      <MessageSquareText />
                      <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                        <span className="truncate font-semibold">
                          {conversation.title}
                        </span>
                        <span className="shrink-0 text-[10px] font-medium text-slate-400">
                          {formatConversationDate(conversation.updated_at)}
                        </span>
                      </span>
                    </SidebarMenuButton>

                    <SidebarMenuAction
                      type="button"
                      showOnHover
                      title="Xóa cuộc trò chuyện"
                      aria-label={`Xóa cuộc trò chuyện: ${conversation.title}`}
                      onClick={(event) => {
                        event.stopPropagation();
                        onRequestDelete(conversation.id);
                      }}
                      className="text-slate-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 />
                    </SidebarMenuAction>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-100 p-4">
        <p className="text-xs font-medium leading-5 text-slate-400">
          AI có thể đưa ra thông tin chưa chính xác. Hãy kiểm tra lại các
          thông tin quan trọng.
        </p>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
