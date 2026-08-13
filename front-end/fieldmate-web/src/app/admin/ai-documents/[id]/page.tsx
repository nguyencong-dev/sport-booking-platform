import { notFound } from "next/navigation";

import { AdminAiDocumentDetailScreen } from "@/screens/AdminAiDocumentDetail/AdminAiDocumentDetailScreen";

type AdminAiDocumentDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminAiDocumentDetailPage({
  params,
}: AdminAiDocumentDetailPageProps) {
  const { id } = await params;
  const documentId = Number(id);

  if (!Number.isInteger(documentId) || documentId <= 0) {
    notFound();
  }

  return <AdminAiDocumentDetailScreen documentId={documentId} />;
}
