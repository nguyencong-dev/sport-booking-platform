import { aiClient, aiEndpoints } from "@/configs/ai-client";
import type {
  ConversationListItemResponse,
  ConversationMessageResponse,
} from "@/types/conversation";

export const conversationService = {
  async getAll(): Promise<ConversationListItemResponse[]> {
    const response = await aiClient.get<ConversationListItemResponse[]>(
      aiEndpoints.conversations,
    );

    return response.data;
  },

  async getMessages(
    conversationId: number,
  ): Promise<ConversationMessageResponse[]> {
    const response = await aiClient.get<ConversationMessageResponse[]>(
      aiEndpoints.conversationMessages(conversationId),
    );

    return response.data;
  },

  async remove(conversationId: number): Promise<void> {
    await aiClient.delete(aiEndpoints.conversation(conversationId));
  },
};
