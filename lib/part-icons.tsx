import {
  Link,
  Settings,
  Disc,
  Circle,
  CircleArrowOutUpLeft,
  CircleArrowOutUpRight,
  Mountain,
  ChevronUp,
  Wrench,
  Droplet,
  LucideIcon,
} from "lucide-react";
import { PartType } from "@/lib/generated/prisma";
import { JSX } from "react";

// Mapowanie typów części na komponenty ikon Lucide
export const PART_ICON_COMPONENTS: Record<PartType, LucideIcon> = {
  [PartType.CHAIN]: Link,
  [PartType.CASSETTE]: Settings,
  [PartType.PADS_FRONT]: Disc,
  [PartType.PADS_REAR]: Disc,
  [PartType.TIRE_FRONT]: CircleArrowOutUpLeft,
  [PartType.TIRE_REAR]: CircleArrowOutUpRight,
  [PartType.HANDLEBAR_TAPE]: Wrench,
  [PartType.SUSPENSION_FORK]: Mountain,
  [PartType.DROPPER_POST]: ChevronUp,
  [PartType.INNER_TUBE_FRONT]: Circle,
  [PartType.INNER_TUBE_REAR]: Circle,
  [PartType.TUBELESS_SEALANT]: Wrench,
  [PartType.SUSPENSION_SEATPOST]: Mountain,
  [PartType.LUBRICANT]: Droplet,
  [PartType.BRAKE_CABLES]: Link,
  [PartType.SHIFT_CABLES]: Link,
  [PartType.BRAKE_FLUID]: Droplet,
};

// Specjalne ikony dla innych typów (np. serwis)
export const SERVICE_ICON = Droplet;

// Funkcja zwracająca ikonę dla danego typu części lub serwisu
export function getPartIconComponent(partType: PartType | string): LucideIcon {
  // Specjalny przypadek dla serwisu
  if (partType === "service" || partType === "CHAIN_LUBE") {
    return SERVICE_ICON;
  }
  return PART_ICON_COMPONENTS[partType as PartType] || Wrench;
}

// Funkcja zwracająca element JSX ikony (dla kompatybilności wstecznej)
export function getCategoryIcon(
  partType: PartType | string,
  className: string = "w-5 h-5"
): JSX.Element {
  const IconComponent = getPartIconComponent(partType);
  return <IconComponent className={className} />;
}
