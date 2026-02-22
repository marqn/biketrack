"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
    >
      <ArrowLeft className="h-4 w-4" />
      Wstecz
    </button>
  );
}
