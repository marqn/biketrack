import { TimelineItem, BikeInfo } from "./types";
import { UnitPreference } from "./units";

export async function exportHistoryToPdf(
  timeline: TimelineItem[],
  bike: BikeInfo | null,
  unitPref: UnitPreference
) {
  const res = await fetch("/api/export/history-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ timeline, bike, unitPref }),
  });

  if (!res.ok) {
    let detail = "";
    try {
      const body = await res.json();
      detail = body?.error ? `: ${body.error}` : "";
    } catch {}
    throw new Error(`Nie udało się wygenerować PDF (${res.status})${detail}`);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;

  const disposition = res.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="([^"]+)"/);
  a.download = match?.[1] ?? "historia-serwisu.pdf";

  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
