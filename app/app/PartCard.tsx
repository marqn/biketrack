"use client";

import { useTransition } from "react";
import { replacePart } from "./actions/replace-part";
import { useRouter } from "next/navigation";

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  children,
  bikeId,
  partType,
}: any) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleReplace() {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("bikeId", bikeId);
      formData.set("partType", partType);

      await replacePart(formData);
      router.refresh(); // możesz też użyć revalidatePath w akcji
    });
  }

  return (
    <div
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        marginTop: 16,
      }}
    >
      <h3>{partName}</h3>

      <div
        style={{
          background: "#eee",
          height: 12,
          borderRadius: 6,
          overflow: "hidden",
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: `${Math.min((wearKm / expectedKm) * 100, 100)}%`,
            height: "100%",
            background: "green",
          }}
        />
      </div>
      <p>{Math.round((wearKm / expectedKm) * 100)}% zużycia</p>

      {children}

      <button
        onClick={() => {
          console.log("Replace button clicked", bikeId, partType)
          startTransition(async () => {
            const formData = new FormData();
            formData.set("bikeId", bikeId); // upewnij się, że to prawidłowy CUID
            formData.set("partType", partType); // np. PartType.CHAIN (dokładnie jak w enum)

            await replacePart(formData);
            router.refresh();
          });
        }}
      >
        🔄 Wymień
      </button>
    </div>
  );
}
