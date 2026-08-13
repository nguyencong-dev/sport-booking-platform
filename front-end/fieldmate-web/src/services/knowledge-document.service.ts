import { aiClient } from "@/services/clients/ai-client";
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
    >("/admin/documents");

    return response.data;
  },

  async getById(documentId: number) {
    const response =
      await aiClient.get<KnowledgeDocumentDetailResponse>(
        `/admin/documents/${documentId}`,
      );

    return response.data;
  },

  async upload(request: KnowledgeDocumentUploadRequest) {
    const response =
      await aiClient.post<KnowledgeDocumentUploadResponse>(
        "/admin/documents/upload",
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
    await aiClient.delete(`/admin/documents/${documentId}`);
  },

  async restore(documentId: number) {
    await aiClient.post(`/admin/documents/${documentId}/restore`);
  },

  async permanentlyDelete(documentId: number) {
    await aiClient.delete(
      `/admin/documents/${documentId}/permanent`,
    );
  },

  async reindex(documentId: number) {
    const response =
      await aiClient.post<KnowledgeDocumentUploadResponse>(
        `/admin/documents/${documentId}/reindex`,
      );

    return response.data;
  },

  async retry(documentId: number) {
    const response =
      await aiClient.post<KnowledgeDocumentUploadResponse>(
        `/admin/documents/${documentId}/retry`,
      );

    return response.data;
  },
};
