import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-6 lg:px-24">
      {/* KmForm skeleton */}
      <div className="mt-4 mx-auto max-w-md border rounded-xl bg-card">
        <div className="p-6 pb-2">
          <Skeleton className="h-4 w-44 mx-auto" />
        </div>
        <div className="p-6 pt-0 space-y-3">
          <Skeleton className="h-11 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-4 w-52 mx-auto" />
        </div>
      </div>

      {/* PartsAccordion skeleton */}
      <div className="border rounded-xl bg-card overflow-hidden divide-y">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-md shrink-0" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-4 w-4 rounded shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}
