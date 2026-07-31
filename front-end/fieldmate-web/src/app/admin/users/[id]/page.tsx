import { notFound } from "next/navigation";

import { AdminUserDetailScreen } from "@/screens/AdminUserDetail/AdminUserDetailScreen";

type AdminUserDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminUserDetailPage({
  params,
}: AdminUserDetailPageProps) {
  const { id } = await params;
  const userId = Number(id);

  if (!Number.isInteger(userId) || userId <= 0) {
    notFound();
  }

  return <AdminUserDetailScreen userId={userId} />;
}
