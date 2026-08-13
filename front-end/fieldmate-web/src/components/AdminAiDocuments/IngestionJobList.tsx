import { AdminEmpty, formatDateTime } from "@/components/Admin/AdminPage";
import { IngestionJobStatusBadge } from "@/components/AdminAiDocuments/AiDocumentStatusBadge";
import type { IngestionJobDetailResponse } from "@/types/knowledge-document";

const jobTypeLabels = {
  pdf_ingestion: "Tiếp nhận PDF",
  document_reindex: "Lập chỉ mục lại",
};

export function IngestionJobList({
  jobs,
}: {
  jobs: IngestionJobDetailResponse[];
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="font-black text-[#073b77]">Lịch sử xử lý</h2>
      </div>

      {jobs.length === 0 ? (
        <AdminEmpty label="Tài liệu chưa có lịch sử xử lý." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4">Mã job</th>
                <th className="px-5 py-4">Loại xử lý</th>
                <th className="px-5 py-4">Trạng thái</th>
                <th className="px-5 py-4">Bắt đầu</th>
                <th className="px-5 py-4">Hoàn thành</th>
                <th className="px-5 py-4">Thông tin lỗi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((job) => (
                <tr key={job.id}>
                  <td className="px-5 py-4 text-sm font-black text-slate-700">
                    #{job.id}
                  </td>
                  <td className="px-5 py-4 text-sm font-semibold text-slate-600">
                    {jobTypeLabels[job.job_type]}
                  </td>
                  <td className="px-5 py-4">
                    <IngestionJobStatusBadge status={job.status} />
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-500">
                    {formatDateTime(job.started_at ?? job.created_at)}
                  </td>
                  <td className="px-5 py-4 text-sm font-medium text-slate-500">
                    {formatDateTime(job.completed_at)}
                  </td>
                  <td className="max-w-80 px-5 py-4 text-sm font-medium text-red-600">
                    <p className="line-clamp-3">
                      {job.error_message || "—"}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
