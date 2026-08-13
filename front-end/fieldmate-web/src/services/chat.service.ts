import { aiClient } from "@/services/clients/ai-client";
import type { ChatRequest, ChatResponse } from "@/types/chat";

export const chatService = {
  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    const response = await aiClient.post<ChatResponse>(
      "/chat",
      request,
    );

    return response.data;
  },
};
