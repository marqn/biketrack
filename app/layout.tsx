import type React from "react";
import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";
import { JetBrains_Mono } from "next/font/google";
import { NavigationViewTransition } from "@/components/navigation-view-transition";
import { CookieBanner } from "@/components/cookie-banner";

const font = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "MBike - Monitoring Serwisowy Roweru",
  description:
    "Aplikacja do śledzenia stanu komponentów i historii serwisów rowerowych",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className={font.variable}>
      <body className="antialiased">
        <Providers>
          <NavigationViewTransition>
            {children}
            <Toaster />
            <CookieBanner />
          </NavigationViewTransition>
        </Providers>
      </body>
    </html>
  );
}
