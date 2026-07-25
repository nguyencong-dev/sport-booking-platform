import { Skeleton } from "@/components/ui/skeleton";

export default function VenueDetailLoading() {
  return (
    <main className="flex-1 bg-slate-50">
      <div className="mx-auto w-full max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="mb-6 h-5 w-52" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
          <Skeleton className="aspect-[16/10] w-full rounded-3xl" />
          <Skeleton className="h-[480px] w-full rounded-3xl" />
        </div>
      </div>
    </main>
  );
}
