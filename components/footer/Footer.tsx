"use client";

import { Bike, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearDisplay =
    currentYear > startYear ? `${startYear}-${currentYear}` : `${currentYear}`;

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-6 py-6">
        <div className="flex flex-col items-center gap-4 text-xs text-muted-foreground text-center">
          {/* Links */}
          <div className="flex items-center gap-4">
            <Link href="/app/blog" className="font-medium text-foreground hover:underline">
              Aktualności
            </Link>
            <Link href="/app/contact" className="font-medium text-foreground hover:underline">
              Kontakt
            </Link>
            <Link href="/terms" className="font-medium text-foreground hover:underline">
              Regulamin
            </Link>
          </div>

          {/* Copyright + version */}
          <div className="flex flex-col items-center gap-1">
            <p>© {yearDisplay} MBike.cc — wszelkie prawa zastrzeżone.</p>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                Created with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{" "}
                <Link href="/app/contact" className="font-medium text-foreground hover:underline">
                  Marqn
                </Link>
              </span>
              <span className="flex items-center gap-1">
                <Bike className="h-3 w-3 text-green-500" />
                ver. 1.2.0
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
