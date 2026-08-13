export type KnowledgeDocumentStatus =
  | "pending"
  | "processing"
  | "ready"
  | "failed"
  | "archived";

export type IngestionJobType =
  | "pdf_ingestion"
  | "document_reindex";

export type IngestionJobStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed";

export type KnowledgeDocumentListItemResponse = {
  id: number;
  title: string;
  original_filename: string | null;
  status: KnowledgeDocumentStatus;
  is_active: boolean;
  created_at: string;
  indexed_at: string | null;
};

export type IngestionJobDetailResponse = {
  id: number;
  job_type: IngestionJobType;
  status: IngestionJobStatus;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
};

export type KnowledgeDocumentDetailResponse =
  KnowledgeDocumentListItemResponse & {
    description: string | null;
    updated_at: string;
    chunk_count: number;
    ingestion_jobs: IngestionJobDetailResponse[];
  };

export type KnowledgeDocumentUploadResponse = {
  document_id: number;
  job_id: number;
  document_status: KnowledgeDocumentStatus;
  job_status: IngestionJobStatus;
  message: string;
};

export type KnowledgeDocumentUploadRequest = {
  file: File;
  title?: string;
};

export type KnowledgeDocumentAction =
  | "archive"
  | "restore"
  | "permanent-delete"
  | "reindex"
  | "retry";
