"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, "accepted");
    setVisible(false);
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm w-[calc(100vw-2rem)] animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-background border rounded-lg shadow-lg p-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            Używamy plików cookie do zapamiętywania Twoich preferencji.
          </p>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5"
            aria-label="Zamknij"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="flex gap-2">
          <Button size="sm" onClick={accept} className="flex-1">
            Akceptuj
          </Button>
          <Button size="sm" variant="outline" onClick={dismiss} className="flex-1">
            Odrzuć
          </Button>
        </div>
      </div>
    </div>
  );
}
