"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  pl: "Polski",
  de: "Deutsch",
  es: "Español",
  it: "Italiano",
};

const LOCALE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  pl: "🇵🇱",
  de: "🇩🇪",
  es: "🇪🇸",
  it: "🇮🇹",
};

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Globe className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleChange(loc)}
            className={loc === locale ? "font-semibold bg-accent" : ""}
          >
            <span className="mr-2">{LOCALE_FLAGS[loc]}</span>
            {LOCALE_LABELS[loc]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
