"use client";

import { Bike, Github, Heart } from "lucide-react";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearDisplay = currentYear > startYear ? `${startYear}-${currentYear}` : `${currentYear}`;

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Section - Branding */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-3">
              <Bike className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-lg">BikeTracker</span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Śledź stan swojego roweru,
              <br />
              jedź bezpiecznie dalej.
            </p>
          </div>

          {/* Middle Section - Motto */}
          <div className="flex flex-col items-center justify-center">
            <p className="text-sm text-muted-foreground italic text-center">
              "Keep your chain lubed and your wheels rolling"
            </p>
          </div>

          {/* Right Section - Links */}
          <div className="flex flex-col items-center justify-center md:items-end gap-2">
            <p className="text-xs text-muted-foreground">v1.0.1</p>
          </div>
        </div>

        {/* Bottom Section - Copyright */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <p>
              © {yearDisplay} BikeTracker. Wszelkie prawa zastrzeżone.
            </p>
            <p className="flex items-center gap-1">
              Created with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{" "}
              <span className="font-semibold text-foreground">Marqn</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
