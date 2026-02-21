"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Interceptuje kliknięcia w Next.js Link-i i owija nawigację
 * w document.startViewTransition() dla płynnych animacji między stronami.
 */
export function NavigationViewTransition({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    if (!("startViewTransition" in document)) return;

    const handleClick = (e: MouseEvent) => {
      // Ignoruj kliknięcia z modyfikatorami (ctrl+click = nowa karta itp.)
      if (e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
      if (e.defaultPrevented) return;
      if (e.button !== 0) return;

      const anchor = (e.target as HTMLElement).closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      // Ignoruj linki otwierane w nowej karcie
      if (anchor.target === "_blank") return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Tylko wewnętrzne linki (zaczynające się od /)
      if (!href.startsWith("/")) return;

      // Ignoruj linki do pobrania
      if (anchor.hasAttribute("download")) return;

      e.preventDefault();

      (document as any).startViewTransition(() => {
        router.push(href);
      });
    };

    // Capture phase — przed Next.js Link handlerem
    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [router]);

  return <>{children}</>;
}
