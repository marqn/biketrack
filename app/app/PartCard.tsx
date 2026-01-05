"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { replacePart } from "./actions/replace-part";
import { PartType } from "@/lib/generated/prisma";

export default function PartCard({
  partName,
  wearKm,
  expectedKm,
  bikeId,
  partType,
  children,
}: {
  partName: string;
  wearKm: number;
  expectedKm: number;
  bikeId: string;
  partType: PartType;
  children?: React.ReactNode;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  async function handleReplace() {
    const formData = new FormData();
    formData.set("bikeId", bikeId);
    formData.set("partType", partType);

    startTransition(async () => {
      await replacePart(formData);
      router.refresh(); // 🔑 aktualizacja UI
    });
  }

  const progressPercent = Math.min((wearKm / expectedKm) * 100, 100);

  return (
    <section style={{ border: "1px solid #ddd", padding: 16, borderRadius: 8, marginTop: 16 }}>
      <h3>{partName}</h3>
      <div style={{ background: "#eee", borderRadius: 4, height: 12, margin: "8px 0" }}>
        <div
          style={{
            width: `${progressPercent}%`,
            background: "#4caf50",
            height: "100%",
            borderRadius: 4,
          }}
        />
      </div>
      <p>
        Zużycie: {wearKm} / {expectedKm} km
      </p>

      {children}

      <button
        onClick={handleReplace}
        disabled={isPending}
        style={{ marginTop: 8 }}
      >
        {isPending ? "Wymieniam..." : "🔄 Wymień"}
      </button>
    </section>
  );
}
