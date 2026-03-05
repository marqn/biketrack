"use client";

import { useEffect } from "react";
import { signOut } from "next-auth/react";

export default function SignOutPage() {
  useEffect(() => {
    document.cookie = "selectedBikeId=; path=/; max-age=0";
    signOut({ callbackUrl: "/login" });
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-muted-foreground text-sm">Wylogowywanie...</p>
    </div>
  );
}
