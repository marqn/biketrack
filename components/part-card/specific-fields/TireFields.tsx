"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TireSpecificData } from "@/lib/part-specific-data";

interface TireFieldsProps {
  data: Partial<TireSpecificData>;
  onChange: (data: Partial<TireSpecificData>) => void;
}

const IMPERIAL_SIZE_MAP: Record<string, string[]> = {
  "18": ['2.00"'],
  "20": ['1.25"', '1.50"', '1.75"', '1.95"', '2.40"', '2.50"'],
  "24": ['1.75"', '1.85"', '1.95"', '2.00"', '2.10"', '2.15"', '2.35"', '2.40"'],
  "26": ['1 3/8"', '1.25"', '1.35"', '1.40"', '1.50"', '1.60"', '1.75"', '1.75x2"', '1.85"', '1.90"', '1.95"', '2.00"', '2.10"', '2.15"', '2.20"', '2.25"', '2.30"', '2.35"', '2.40"', '2.45"', '2.50"', '4.00"'],
  "27": ['1 1/4"', '1 3/8"'],
  "27.5": ['1.00"', '1.10"', '1.20"', '1.25"', '1.30"', '1.35"', '1.40"', '1.50"', '1.60"', '1.65"', '1.70"', '1.75"', '1.85"', '1.90"', '1.95"', '2.00"', '2.10"', '2.15"', '2.20"', '2.25"', '2.30"', '2.35"', '2.40"', '2.50"', '2.60"', '2.80"', '1 3/8 x 1 1/2"'],
  "28": ['0.9"', '1.00"', '1.10"', '1.20"', '1.25"', '1.30"', '1.35"', '1.40"', '1.50"', '1.60"', '1.65"', '1.70"', '1.75"', '1.85"', '2.00"', '2.15"', '2.20"', '2.35"', '2.50"', '1 1/4 x 1 3/4"', '1 3/8"', '1 3/8 x 1 5/8"', '1 1/2"', '1 5/8"', '1 5/8 x 1 1/8"', '1 5/8 x 1 1/4"', '1 5/8 x 1 3/8"'],
  "29": ['1.40"', '1.60"', '1.90"', '2.00"', '2.10"', '2.15"', '2.20"', '2.25"', '2.30"', '2.35"'],
};

const FRENCH_SIZE_MAP: Record<string, string[]> = {
  "700": ["20C", "22C", "23C", "24C", "25C", "26C", "28C", "29C", "30C", "31C", "32C", "33C", "34C", "35C", "36C", "37C", "38C", "40C", "42C", "43C", "44C", "45C", "47C", "48C", "50C", "52C", "55C"],
  "650": ["25C", "28C", "30C", "32C", "35C", "38B", "40C", "42C", "45B", "47C", "48C", "50C", "54C"],
};

const IMPERIAL_DIAMETERS = Object.keys(IMPERIAL_SIZE_MAP);
const FRENCH_DIAMETERS = Object.keys(FRENCH_SIZE_MAP);

export default function TireFields({ data, onChange }: TireFieldsProps) {
  const sizeFormat = data.sizeFormat || "french";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="tire-bead">Typ</Label>
        <Select
          value={data.beadType || "folding"}
          onValueChange={(value) =>
            onChange({ ...data, beadType: value as TireSpecificData["beadType"] })
          }
        >
          <SelectTrigger id="tire-bead">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wired">Drutowa</SelectItem>
            <SelectItem value="folding">Zwijana</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tire-tubeless">Tubeless Ready</Label>
        <Select
          value={data.tubelessReady ? "yes" : "no"}
          onValueChange={(value) =>
            onChange({ ...data, tubelessReady: value === "yes" })
          }
        >
          <SelectTrigger id="tire-tubeless">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Tak</SelectItem>
            <SelectItem value="no">Nie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tire-hookless">Hookless</Label>
        <Select
          value={data.hookless ? "yes" : "no"}
          onValueChange={(value) =>
            onChange({ ...data, hookless: value === "yes" })
          }
        >
          <SelectTrigger id="tire-hookless">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Tak</SelectItem>
            <SelectItem value="no">Nie</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tire-tread">Typ bieżnika</Label>
        <Select
          value={data.treadType || "slick"}
          onValueChange={(value) =>
            onChange({ ...data, treadType: value as TireSpecificData["treadType"] })
          }
        >
          <SelectTrigger id="tire-tread">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="slick">Slick</SelectItem>
            <SelectItem value="semi-slick">Semi-slick</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="tire-size-format">Format rozmiaru</Label>
        <Select
          value={sizeFormat}
          onValueChange={(value) => {
            const format = value as TireSpecificData["sizeFormat"];
            if (format === "imperial") {
              onChange({ ...data, sizeFormat: format, sizeImperial: data.sizeImperial || "28 x 1.50\"" });
            } else {
              onChange({ ...data, sizeFormat: format, sizeFrench: data.sizeFrench || "700 x 28C" });
            }
          }}
        >
          <SelectTrigger id="tire-size-format">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="imperial">Calowy</SelectItem>
            <SelectItem value="french">Francuski</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {sizeFormat === "imperial" ? (
        <ImperialSizeFields
          value={data.sizeImperial || ""}
          onChange={(value) => onChange({ ...data, sizeImperial: value })}
        />
      ) : (
        <FrenchSizeFields
          value={data.sizeFrench || ""}
          onChange={(value) => onChange({ ...data, sizeFrench: value })}
        />
      )}
    </div>
  );
}

function ImperialSizeFields({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Parse "28 x 1.50"" → diameter="28", width='1.50"'
  const match = value.match(/^(\d+(?:\.\d+)?)\s*x\s*(.+)$/);
  const diameter = match?.[1] || "";
  const widthPart = match?.[2] || "";
  const availableWidths = diameter ? (IMPERIAL_SIZE_MAP[diameter] || []) : [];

  const handleDiameterChange = (newDiameter: string) => {
    const widths = IMPERIAL_SIZE_MAP[newDiameter] || [];
    if (widthPart && widths.includes(widthPart)) {
      onChange(`${newDiameter} x ${widthPart}`);
    } else {
      onChange(`${newDiameter} x ${widths[0] || ""}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Rozmiar calowy</Label>
      <div className="flex gap-2 items-center">
        <Select value={diameter} onValueChange={handleDiameterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Średnica" />
          </SelectTrigger>
          <SelectContent>
            {IMPERIAL_DIAMETERS.map((d) => (
              <SelectItem key={d} value={d}>{d}&quot;</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground shrink-0">x</span>
        <Select
          value={widthPart}
          onValueChange={(w) => onChange(`${diameter} x ${w}`)}
          disabled={!diameter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Szerokość" />
          </SelectTrigger>
          <SelectContent>
            {availableWidths.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function FrenchSizeFields({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  // Parse "700 x 28C" → diameter="700", widthPart="28C"
  const match = value.match(/^(\d+)\s*x\s*(.+)$/);
  const diameter = match?.[1] || "";
  const widthPart = match?.[2] || "";
  const availableWidths = diameter ? (FRENCH_SIZE_MAP[diameter] || []) : [];

  const handleDiameterChange = (newDiameter: string) => {
    const widths = FRENCH_SIZE_MAP[newDiameter] || [];
    if (widthPart && widths.includes(widthPart)) {
      onChange(`${newDiameter} x ${widthPart}`);
    } else {
      onChange(`${newDiameter} x ${widths[0] || ""}`);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Rozmiar francuski</Label>
      <div className="flex gap-2 items-center">
        <Select value={diameter} onValueChange={handleDiameterChange}>
          <SelectTrigger>
            <SelectValue placeholder="Średnica" />
          </SelectTrigger>
          <SelectContent>
            {FRENCH_DIAMETERS.map((d) => (
              <SelectItem key={d} value={d}>{d}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-muted-foreground shrink-0">x</span>
        <Select
          value={widthPart}
          onValueChange={(w) => onChange(`${diameter} x ${w}`)}
          disabled={!diameter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Szerokość" />
          </SelectTrigger>
          <SelectContent>
            {availableWidths.map((w) => (
              <SelectItem key={w} value={w}>{w}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
