"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <Button
      size={"sm"}
      variant="secondary"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      🚶‍♂️ Wyloguj się
    </Button>
  );
}
