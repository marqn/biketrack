import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 space-y-6">
      {/* Nagłówek */}
      <div className="flex flex-col items-center gap-2">
        <Skeleton className="h-8 w-24" />
        <Skeleton className="h-9 w-48 rounded-lg" />
      </div>

      {/* Lista części */}
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="border rounded-xl bg-card p-4 flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-lg shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="flex gap-2 shrink-0">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-8 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
