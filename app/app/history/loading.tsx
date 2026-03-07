import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 lg:px-24 px-4 py-8">
      {/* Nagłówek + przyciski filtrów */}
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="h-8 w-32" />
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-28 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-4 pl-6 border-l-2 border-border ml-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="relative pl-6">
            {/* Kropka na osi czasu */}
            <Skeleton className="absolute -left-[1.85rem] top-3 h-5 w-5 rounded-full" />
            <div className="border rounded-xl bg-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
