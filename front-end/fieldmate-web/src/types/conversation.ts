import type { ChatRole } from "@/types/chat";

export type ConversationListItemResponse = {
  id: number;
  title: string;
  created_at: string;
  updated_at: string;
};

export type ConversationMessageResponse = {
  id: number;
  role: ChatRole;
  content: string;
  created_at: string;
};
