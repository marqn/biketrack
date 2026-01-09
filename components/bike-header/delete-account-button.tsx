"use client";

import { Button } from "@/components/ui/button";
import { deleteAccount } from "./actions/delete-account";

export default function DeleteAccountButton() {
  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  return (
    <Button size={"sm"} variant="destructive" onClick={handleDeleteAccount}>
      🗑️ Usuń konto
    </Button>
  );
}
