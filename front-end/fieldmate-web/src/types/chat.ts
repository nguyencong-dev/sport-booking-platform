export type ChatRole = "user" | "assistant";

export type ChatRequest = {
  conversation_id?: number;
  message: string;
  latitude?: number;
  longitude?: number;
};

export type ChatSourceResponse = {
  chunk_id: number;
  document_id: number;
  document_title: string;
  page_number: number | null;
  similarity: number;
};

export type ChatResponse = {
  conversation_id: number;
  user_message_id: number;
  assistant_message_id: number;
  answer: string;
  sources: ChatSourceResponse[];
};

export type ChatMessageStatus = "sending" | "sent" | "error";

export type ChatMessageItem = {
  clientId: string;
  id?: number;
  role: ChatRole;
  content: string;
  createdAt: string;
  status: ChatMessageStatus;
  sources: ChatSourceResponse[];
};
