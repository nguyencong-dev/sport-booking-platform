import { aiClient } from "@/services/clients/ai-client";
import type {
  ConversationListItemResponse,
  ConversationMessageResponse,
} from "@/types/conversation";

export const conversationService = {
  async getAll(): Promise<ConversationListItemResponse[]> {
    const response = await aiClient.get<ConversationListItemResponse[]>(
      "/conversations",
    );

    return response.data;
  },

  async getMessages(
    conversationId: number,
  ): Promise<ConversationMessageResponse[]> {
    const response = await aiClient.get<ConversationMessageResponse[]>(
      `/conversations/${conversationId}/messages`,
    );

    return response.data;
  },

  async remove(conversationId: number): Promise<void> {
    await aiClient.delete(`/conversations/${conversationId}`);
  },
};
