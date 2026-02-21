import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { PDFDocument, rgb, PDFFont } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import fs from "fs";
import path from "path";
import {
  TimelineItem,
  PartReplacement,
  ServiceEvent,
  BikeInfo,
} from "@/lib/types";
import { formatDistance, UnitPreference } from "@/lib/units";
import { getPartName } from "@/lib/default-parts";
import { formatDate } from "@/lib/utils";

export const runtime = "nodejs";

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGIN = 40;
const CONTENT_W = PAGE_W - MARGIN * 2; // 515.28
const FIXED_COLS = 72 + 76 + 116 + 56 + 56; // 376
const COL_WIDTHS = [72, 76, 116, 56, 56, CONTENT_W - FIXED_COLS]; // last ~139
const HEADER_H = 22;
const ROW_H = 18;

function truncateToWidth(
  text: string,
  maxW: number,
  font: PDFFont,
  size: number
): string {
  if (font.widthOfTextAtSize(text, size) <= maxW) return text;
  let lo = 0,
    hi = text.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (font.widthOfTextAtSize(text.slice(0, mid) + "…", size) <= maxW) {
      lo = mid;
    } else {
      hi = mid - 1;
    }
  }
  return lo === 0 ? "…" : text.slice(0, lo) + "…";
}

async function buildPdf(
  timeline: TimelineItem[],
  bike: BikeInfo | null,
  unitPref: UnitPreference
): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const fontsDir = path.join(process.cwd(), "public", "fonts");
  const [regularBytes, boldBytes] = [
    fs.readFileSync(path.join(fontsDir, "Roboto-Regular.woff2")),
    fs.readFileSync(path.join(fontsDir, "Roboto-Bold.woff2")),
  ];
  const [regular, bold] = await Promise.all([
    pdfDoc.embedFont(regularBytes),
    pdfDoc.embedFont(boldBytes),
  ]);

  const bikeName = bike
    ? bike.brand || bike.model
      ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
      : bike.name || "Rower"
    : "Rower";

  let page = pdfDoc.addPage([PAGE_W, PAGE_H]);
  let topY = MARGIN; // distance from top of page

  const centeredText = (
    t: string,
    size: number,
    font: PDFFont,
    color = rgb(0, 0, 0)
  ) => {
    const w = font.widthOfTextAtSize(t, size);
    page.drawText(t, {
      x: (PAGE_W - w) / 2,
      y: PAGE_H - topY - size,
      size,
      font,
      color,
    });
  };

  // ── Nagłówek ──────────────────────────────────────────────
  centeredText("Historia Serwisu", 22, bold, rgb(37 / 255, 99 / 255, 235 / 255));
  topY += 28;
  centeredText(bikeName, 13, regular, rgb(0.23, 0.23, 0.23));
  topY += 18;

  const exportDate = new Date().toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  centeredText(`Wygenerowano: ${exportDate}`, 9, regular, rgb(0.5, 0.5, 0.5));
  topY += 14;

  page.drawLine({
    start: { x: MARGIN, y: PAGE_H - topY },
    end: { x: PAGE_W - MARGIN, y: PAGE_H - topY },
    thickness: 0.5,
    color: rgb(37 / 255, 99 / 255, 235 / 255),
  });
  topY += 12;

  // ── Statystyki ────────────────────────────────────────────
  const replacementsCount = timeline.filter(
    (i) => i.type === "replacement"
  ).length;
  const servicesCount = timeline.filter((i) => i.type === "service").length;

  const statItems = [
    {
      value: `${replacementsCount}`,
      label: "Wymiany",
      color: rgb(37 / 255, 99 / 255, 235 / 255),
    },
    {
      value: `${servicesCount}`,
      label: "Smarowania",
      color: rgb(0, 160 / 255, 160 / 255),
    },
    ...(bike
      ? [
          {
            value: formatDistance(bike.totalKm, unitPref),
            label: "Łączny przebieg",
            color: rgb(22 / 255, 163 / 255, 74 / 255),
          },
        ]
      : []),
  ];

  const statColW = CONTENT_W / statItems.length;
  statItems.forEach((s, i) => {
    const cx = MARGIN + statColW * i + statColW / 2;
    const vw = bold.widthOfTextAtSize(s.value, 11);
    const lw = regular.widthOfTextAtSize(s.label, 8);
    page.drawText(s.value, {
      x: cx - vw / 2,
      y: PAGE_H - topY - 11,
      size: 11,
      font: bold,
      color: s.color,
    });
    page.drawText(s.label, {
      x: cx - lw / 2,
      y: PAGE_H - topY - 11 - 14,
      size: 8,
      font: regular,
      color: rgb(0.4, 0.4, 0.4),
    });
  });
  topY += 32;

  // ── Tabela ────────────────────────────────────────────────
  const HEADERS = ["Data", "Typ", "Opis", "Przebieg", "Zużycie", "Notatki"];

  const tableRows: string[][] = timeline.map((item) => {
    if (item.type === "service") {
      const s = item.data as ServiceEvent;
      const product = s.lubricantProduct
        ? `${s.lubricantProduct.brand} ${s.lubricantProduct.model}`
        : s.lubricantBrand || "—";
      return [
        formatDate(s.createdAt),
        "Smarowanie",
        product,
        formatDistance(s.kmAtTime, unitPref),
        "—",
        s.notes || "—",
      ];
    } else {
      const p = item.data as PartReplacement;
      const label = getPartName(p.partType || "");
      const desc =
        p.brand && p.model ? `${p.brand} ${p.model}` : label;
      return [
        formatDate(p.createdAt || ""),
        label,
        desc,
        formatDistance(p.kmAtReplacement, unitPref),
        formatDistance(p.kmUsed, unitPref),
        p.notes || "—",
      ];
    }
  });

  const drawTableHeader = () => {
    page.drawRectangle({
      x: MARGIN,
      y: PAGE_H - topY - HEADER_H,
      width: CONTENT_W,
      height: HEADER_H,
      color: rgb(37 / 255, 99 / 255, 235 / 255),
    });
    let cx = MARGIN;
    HEADERS.forEach((h, i) => {
      page.drawText(h, {
        x: cx + 4,
        y: PAGE_H - topY - HEADER_H + 7,
        size: 9,
        font: bold,
        color: rgb(1, 1, 1),
      });
      cx += COL_WIDTHS[i];
    });
    topY += HEADER_H;
  };

  drawTableHeader();

  tableRows.forEach((row, rowIdx) => {
    if (topY + ROW_H > PAGE_H - MARGIN) {
      page = pdfDoc.addPage([PAGE_W, PAGE_H]);
      topY = MARGIN;
      drawTableHeader();
    }

    if (rowIdx % 2 === 1) {
      page.drawRectangle({
        x: MARGIN,
        y: PAGE_H - topY - ROW_H,
        width: CONTENT_W,
        height: ROW_H,
        color: rgb(245 / 255, 248 / 255, 1),
      });
    }

    let cx = MARGIN;
    row.forEach((cell, colIdx) => {
      const colW = COL_WIDTHS[colIdx];
      const displayText = truncateToWidth(cell, colW - 8, regular, 8);

      let color = rgb(0, 0, 0);
      if (colIdx === 1) {
        color =
          cell === "Smarowanie"
            ? rgb(0, 130 / 255, 130 / 255)
            : rgb(37 / 255, 99 / 255, 235 / 255);
      }

      page.drawText(displayText, {
        x: cx + 4,
        y: PAGE_H - topY - ROW_H + 5,
        size: 8,
        font: regular,
        color,
      });
      cx += colW;
    });

    topY += ROW_H;
  });

  // ── Stopka ────────────────────────────────────────────────
  const pageCount = pdfDoc.getPageCount();
  for (let i = 0; i < pageCount; i++) {
    const p = pdfDoc.getPage(i);
    const footer = `MBike App — Strona ${i + 1} z ${pageCount}`;
    const fw = regular.widthOfTextAtSize(footer, 8);
    p.drawText(footer, {
      x: (PAGE_W - fw) / 2,
      y: 10,
      size: 8,
      font: regular,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  return Buffer.from(await pdfDoc.save());
}

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isPremium =
      token.plan === "PREMIUM" &&
      token.planExpiresAt &&
      new Date(token.planExpiresAt) > new Date();

    if (!isPremium) {
      return NextResponse.json({ error: "Premium required" }, { status: 403 });
    }

    const { timeline, bike, unitPref } = (await req.json()) as {
      timeline: TimelineItem[];
      bike: BikeInfo | null;
      unitPref: UnitPreference;
    };

    const pdfBuffer = await buildPdf(timeline, bike, unitPref);

    const bikeName = bike
      ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim() || "rower"
      : "rower";
    const safeFileName = bikeName
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");
    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = `historia-serwisu-${safeFileName}-${dateStr}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err) {
    console.error("[PDF Export Error]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 }
    );
  }
}
