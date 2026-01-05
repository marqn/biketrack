"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { addChainLube } from "./actions/add-chain-lube";

export default function LubeButton({
  bikeId,
}: {
  bikeId: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function action(formData: FormData) {
    startTransition(async () => {
      await addChainLube(formData);
      router.refresh(); // 🔑 TO JEST KLUCZ
    });
  }

  return (
    <form action={action}>
      <input type="hidden" name="bikeId" value={bikeId} />
      <button disabled={isPending}>
        {isPending ? "Smarowanie..." : "🛢️ Smaruj"}
      </button>
    </form>
  );
}
