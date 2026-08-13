"use client";

import axios from "axios";
import { LoaderCircle, MessageSquareX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { AssistantSidebar } from "@/components/Assistant/AssistantSidebar";
import { ChatPanel } from "@/components/Assistant/ChatPanel";
import { ChatSourceSheet } from "@/components/Assistant/ChatSourceSheet";
import { ConfirmationDialog } from "@/components/ConfirmationDialog/ConfirmationDialog";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";
import { chatService } from "@/services/chat.service";
import { conversationService } from "@/services/conversation.service";
import type {
  ChatMessageItem,
  ChatSourceResponse,
} from "@/types/chat";
import type {
  ConversationListItemResponse,
  ConversationMessageResponse,
} from "@/types/conversation";

function createClientId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function toChatMessage(
  message: ConversationMessageResponse,
): ChatMessageItem {
  return {
    clientId: `message-${message.id}`,
    id: message.id,
    role: message.role,
    content: message.content,
    createdAt: message.created_at,
    status: "sent",
    sources: [],
  };
}

function getRequestErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ detail?: string }>(error)) {
    return error.response?.data?.detail || fallback;
  }

  return fallback;
}

export function AssistantScreen() {
  const router = useRouter();
  const { user, ready, isAuthenticated } = useAuth();

  const [conversations, setConversations] = useState<
    ConversationListItemResponse[]
  >([]);
  const [selectedConversationId, setSelectedConversationId] = useState<
    number | undefined
  >();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);

  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [conversationError, setConversationError] = useState("");
  const [messageError, setMessageError] = useState("");

  const [deleteConversationId, setDeleteConversationId] = useState<
    number | null
  >(null);
  const [selectedSources, setSelectedSources] = useState<
    ChatSourceResponse[]
  >([]);
  const [sourceSheetOpen, setSourceSheetOpen] = useState(false);

  const skipNextMessageLoadRef = useRef<number | null>(null);
  const userFullName = user
    ? [user.lastName, user.firstName].filter(Boolean).join(" ")
    : "Người dùng";
  const userInitials = user
    ? `${user.lastName?.charAt(0) ?? ""}${
        user.firstName?.charAt(0) ?? ""
      }`.toUpperCase() || "FM"
    : "FM";

  useEffect(() => {
    if (!ready) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/login");
      return;
    }

    if (user?.role !== "CUSTOMER") {
      router.replace(user?.role === "ADMIN" ? "/admin" : "/my-venues");
    }
  }, [isAuthenticated, ready, router, user]);

  useEffect(() => {
    if (!ready || !isAuthenticated || user?.role !== "CUSTOMER") {
      return;
    }

    let active = true;

    async function loadConversations() {
      try {
        const response = await conversationService.getAll();

        if (!active) {
          return;
        }

        setConversations(response);
        setConversationError("");
      } catch (error) {
        if (active) {
          setConversationError(
            getRequestErrorMessage(
              error,
              "Không thể tải lịch sử trò chuyện.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingConversations(false);
        }
      }
    }

    void loadConversations();

    return () => {
      active = false;
    };
  }, [isAuthenticated, ready, user]);

  useEffect(() => {
    if (
      !ready ||
      !isAuthenticated ||
      user?.role !== "CUSTOMER" ||
      !selectedConversationId
    ) {
      return;
    }

    if (skipNextMessageLoadRef.current === selectedConversationId) {
      skipNextMessageLoadRef.current = null;
      return;
    }

    let active = true;

    async function loadMessages() {
      try {
        const response = await conversationService.getMessages(
          selectedConversationId!,
        );

        if (active) {
          setMessages(response.map(toChatMessage));
          setMessageError("");
        }
      } catch (error) {
        if (active) {
          setMessageError(
            getRequestErrorMessage(
              error,
              "Không thể tải nội dung cuộc trò chuyện.",
            ),
          );
        }
      } finally {
        if (active) {
          setLoadingMessages(false);
        }
      }
    }

    void loadMessages();

    return () => {
      active = false;
    };
  }, [isAuthenticated, ready, selectedConversationId, user]);

  function handleSelectConversation(conversationId: number) {
    if (conversationId === selectedConversationId) {
      return;
    }

    setSelectedConversationId(conversationId);
    setMessages([]);
    setMessageError("");
    setLoadingMessages(true);
  }

  function handleCreateNewConversation() {
    setSelectedConversationId(undefined);
    setMessages([]);
    setConversationError("");
    setMessageError("");
    setLoadingMessages(false);
    setSelectedSources([]);
    setSourceSheetOpen(false);
  }

  async function sendMessage(
    content: string,
    existingUserClientId?: string,
  ) {
    const cleanedContent = content.trim();

    if (!cleanedContent || sending) {
      return;
    }

    const userClientId =
      existingUserClientId ?? createClientId("user");
    const assistantClientId = createClientId("assistant");
    const now = new Date().toISOString();

    setSending(true);
    setMessageError("");

    setMessages((current) => {
      const currentWithoutPendingAssistant = current.filter(
        (message) =>
          !(
            message.role === "assistant" && message.status === "sending"
          ),
      );

      const nextMessages = existingUserClientId
        ? currentWithoutPendingAssistant.map((message) =>
            message.clientId === existingUserClientId
              ? { ...message, status: "sending" as const }
              : message,
          )
        : [
            ...currentWithoutPendingAssistant,
            {
              clientId: userClientId,
              role: "user" as const,
              content: cleanedContent,
              createdAt: now,
              status: "sending" as const,
              sources: [],
            },
          ];

      return [
        ...nextMessages,
        {
          clientId: assistantClientId,
          role: "assistant",
          content: "",
          createdAt: now,
          status: "sending",
          sources: [],
        },
      ];
    });

    try {
      const response = await chatService.sendMessage({
        conversation_id: selectedConversationId,
        message: cleanedContent,
      });

      setMessages((current) =>
        current.map((message) => {
          if (message.clientId === userClientId) {
            return {
              ...message,
              id: response.user_message_id,
              status: "sent",
            };
          }

          if (message.clientId === assistantClientId) {
            return {
              ...message,
              id: response.assistant_message_id,
              content: response.answer,
              status: "sent",
              sources: response.sources,
            };
          }

          return message;
        }),
      );

      if (!selectedConversationId) {
        skipNextMessageLoadRef.current = response.conversation_id;
        setSelectedConversationId(response.conversation_id);
        setLoadingMessages(false);
      }

      try {
        const refreshedConversations = await conversationService.getAll();
        setConversations(refreshedConversations);
        setConversationError("");
      } catch {
        setConversationError("Không thể cập nhật danh sách trò chuyện.");
      }
    } catch (error) {
      setMessages((current) =>
        current
          .filter((message) => message.clientId !== assistantClientId)
          .map((message) =>
            message.clientId === userClientId
              ? { ...message, status: "error" }
              : message,
          ),
      );

      setMessageError(
        getRequestErrorMessage(
          error,
          "Trợ lý chưa thể phản hồi. Vui lòng thử lại.",
        ),
      );
    } finally {
      setSending(false);
    }
  }

  function handleRetry(message: ChatMessageItem) {
    if (message.role !== "user" || message.status !== "error") {
      return;
    }

    void sendMessage(message.content, message.clientId);
  }

  async function handleDeleteConversation() {
    if (deleteConversationId === null) {
      return;
    }

    setDeleting(true);

    try {
      await conversationService.remove(deleteConversationId);

      const remainingConversations = conversations.filter(
        (conversation) => conversation.id !== deleteConversationId,
      );

      setConversations(remainingConversations);
      setDeleteConversationId(null);
      setConversationError("");

      if (selectedConversationId === deleteConversationId) {
        const nextConversationId = remainingConversations[0]?.id;

        setSelectedConversationId(nextConversationId);
        setMessages([]);
        setMessageError("");
        setLoadingMessages(Boolean(nextConversationId));
      }
    } catch (error) {
      setConversationError(
        getRequestErrorMessage(
          error,
          "Không thể xóa cuộc trò chuyện.",
        ),
      );
    } finally {
      setDeleting(false);
    }
  }

  function handleOpenSources(sources: ChatSourceResponse[]) {
    setSelectedSources(sources);
    setSourceSheetOpen(true);
  }

  if (!ready) {
    return (
      <main className="flex min-h-[calc(100svh-5rem)] flex-1 items-center justify-center bg-[#f6f8fb]">
        <div className="flex items-center gap-3 font-semibold text-slate-500">
          <LoaderCircle className="size-5 animate-spin text-[#ff174f]" />
          Đang chuẩn bị trợ lý...
        </div>
      </main>
    );
  }

  if (!isAuthenticated || !user || user.role !== "CUSTOMER") {
    return null;
  }

  return (
    <SidebarProvider className="min-h-[calc(100svh-5rem)] flex-1 bg-[#f6f8fb]">
      <AssistantSidebar
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        loading={loadingConversations}
        onSelect={handleSelectConversation}
        onCreateNew={handleCreateNewConversation}
        onRequestDelete={setDeleteConversationId}
      />

      <SidebarInset className="min-h-[calc(100svh-5rem)] overflow-hidden bg-[#f6f8fb]">
        <ChatPanel
          userAvatar={user?.avatar}
          userName={userFullName}
          userInitials={userInitials}
          messages={messages}
          loading={loadingMessages}
          sending={sending}
          error={messageError || conversationError}
          onSend={(message) => void sendMessage(message)}
          onRetry={handleRetry}
          onOpenSources={handleOpenSources}
        />
      </SidebarInset>

      <ChatSourceSheet
        open={sourceSheetOpen}
        sources={selectedSources}
        onOpenChange={setSourceSheetOpen}
      />

      <ConfirmationDialog
        open={deleteConversationId !== null}
        title="Xóa cuộc trò chuyện?"
        description="Lịch sử tin nhắn trong cuộc trò chuyện này sẽ bị xóa và không thể khôi phục."
        confirmLabel="Xóa cuộc trò chuyện"
        loading={deleting}
        variant="destructive"
        icon={MessageSquareX}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConversationId(null);
          }
        }}
        onConfirm={handleDeleteConversation}
      />
    </SidebarProvider>
  );
}
