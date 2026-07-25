import { Skeleton } from "@/components/ui/skeleton";

export default function VenuesLoading() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1280px] px-4 py-10 sm:px-6 lg:px-8">
      <Skeleton className="mb-8 h-5 w-40" />
      <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
        <Skeleton className="h-[520px] rounded-2xl" />
        <div>
          <Skeleton className="mb-6 h-12 w-full rounded-xl" />
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={index} className="h-[390px] rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
