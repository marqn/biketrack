import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="px-4 py-8 max-w-2xl mx-auto space-y-4">
      {/* Nagłówek */}
      <Skeleton className="h-8 w-40 mx-auto" />

      {/* Lista powiadomień */}
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border rounded-xl bg-card p-4 flex gap-3">
          <Skeleton className="h-9 w-9 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
