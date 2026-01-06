"use client";

import { Button } from "@/components/ui/button";
import { deleteAccount } from "./actions/delete-account";

export default function DeleteAccountButton() {
  return (
    <form action={deleteAccount}>
      <Button size={"sm"} variant="destructive">
        🗑️ Usuń konto
      </Button>
    </form>
  );
}
