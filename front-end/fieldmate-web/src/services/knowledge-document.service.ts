import { aiClient, aiEndpoints } from "@/configs/ai-client";
import type {
  KnowledgeDocumentDetailResponse,
  KnowledgeDocumentListItemResponse,
  KnowledgeDocumentUploadRequest,
  KnowledgeDocumentUploadResponse,
} from "@/types/knowledge-document";

function createUploadFormData(
  request: KnowledgeDocumentUploadRequest,
) {
  const formData = new FormData();

  formData.append("file", request.file);

  if (request.title?.trim()) {
    formData.append("title", request.title.trim());
  }

  return formData;
}

export const knowledgeDocumentService = {
  async getAll() {
    const response = await aiClient.get<
      KnowledgeDocumentListItemResponse[]
    >(aiEndpoints.documents);

    return response.data;
  },

  async getById(documentId: number) {
    const response =
      await aiClient.get<KnowledgeDocumentDetailResponse>(
        aiEndpoints.document(documentId),
      );

    return response.data;
  },

  async upload(request: KnowledgeDocumentUploadRequest) {
    const response =
      await aiClient.post<KnowledgeDocumentUploadResponse>(
        aiEndpoints.uploadDocument,
        createUploadFormData(request),
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

    return response.data;
  },

  async archive(documentId: number) {
    await aiClient.delete(aiEndpoints.document(documentId));
  },

  async restore(documentId: number) {
    await aiClient.post(aiEndpoints.restoreDocument(documentId));
  },

  async permanentlyDelete(documentId: number) {
    await aiClient.delete(
      aiEndpoints.permanentlyDeleteDocument(documentId),
    );
  },

  async reindex(documentId: number) {
    const response =
      await aiClient.post<KnowledgeDocumentUploadResponse>(
        aiEndpoints.reindexDocument(documentId),
      );

    return response.data;
  },

  async retry(documentId: number) {
    const response =
      await aiClient.post<KnowledgeDocumentUploadResponse>(
        aiEndpoints.retryDocument(documentId),
      );

    return response.data;
  },
};
