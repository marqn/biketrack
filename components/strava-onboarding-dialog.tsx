"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

const StravaIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-orange-500">
    <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
  </svg>
);

export function StravaOnboardingDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // Usuń parametr z URL bez przeładowania strony
    const url = new URL(window.location.href);
    url.searchParams.delete("stravaSync");
    router.replace(url.pathname + url.search, { scroll: false });
  }, [router]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center gap-3">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-8 w-8 text-green-500" />
            <StravaIcon />
          </div>
          <DialogTitle className="text-xl">Strava zsynchronizowana</DialogTitle>
          <DialogDescription>
            Twoje rowery i przebiegi zostały pobrane ze Strava i są gotowe do użycia.
          </DialogDescription>
        </DialogHeader>
        <Button onClick={() => setOpen(false)} className="w-full mt-2">
          Rozumiem
        </Button>
      </DialogContent>
    </Dialog>
  );
}
