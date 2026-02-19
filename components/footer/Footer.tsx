"use client";

import { Bike, Heart } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function Footer() {
  const t = useTranslations();
  const currentYear = new Date().getFullYear();
  const startYear = 2025;
  const yearDisplay =
    currentYear > startYear ? `${startYear}-${currentYear}` : `${currentYear}`;

  return (
    <footer className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-8 py-8">
        {/* Bottom Section - Copyright */}
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex flex-col gap-2">
              <Link
                href="/app/blog"
                className="font-semibold text-foreground hover:underline"
              >
                {t("nav.news")}
              </Link>
              <Link
                href="/app/contact"
                className="font-semibold text-foreground hover:underline"
              >
                {t("nav.contact")}
              </Link>
              <p>© {yearDisplay} MBike. {t("common.allRightsReserved")}</p>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                Created with{" "}
                <Heart className="h-3 w-3 text-red-500 fill-red-500" /> by{" "}
                <Link
                  href="/app/contact"
                  className="font-semibold text-foreground hover:underline"
                >
                  Marqn
                </Link>
              </div>

              <p className="flex items-center gap-1 justify-evenly">
                <Bike className="h-3 w-3 text-green-500" />
                ver. 1.0.1
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
