import {
  Link,
  Mountain,
  ChevronUp,
  Wrench,
  Droplet,
  LucideIcon,
} from "lucide-react";
import { PartType } from "@/lib/generated/prisma";
import { PART_ICONS } from "@/lib/default-parts";
import { forwardRef, JSX } from "react";

// Fabryka ikon rowerowych - tworzy komponent SVG kompatybilny z Lucide
function createBikeIcon(name: string, children: React.ReactNode) {
  const Icon = forwardRef<SVGSVGElement, React.SVGAttributes<SVGSVGElement>>(
    ({ className, ...props }, ref) => (
      <svg
        ref={ref}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        {...props}
      >
        {children}
      </svg>
    )
  );
  Icon.displayName = name;
  return Icon as unknown as LucideIcon;
}

// --- Ikony części rowerowych ---

// Rama (diamond frame - obrys z rurą podsiodłową)
const BikeFrameIcon = createBikeIcon("BikeFrameIcon", <>
  <path d="M3 8 L5 13 L11 21 L21 21 L15 3 Z" />
  <line x1="15" y1="3" x2="11" y2="21" />
</>);

// Widelec (widok z przodu - rurka sterowa, korona, nogi)
const BikeForkIcon = createBikeIcon("BikeForkIcon", <>
  <line x1="12" y1="2" x2="12" y2="8" />
  <line x1="6" y1="8" x2="18" y2="8" />
  <line x1="6" y1="8" x2="5" y2="22" />
  <line x1="18" y1="8" x2="19" y2="22" />
</>);

// Suport (oś z łożyskami)
const BottomBracketIcon = createBikeIcon("BottomBracketIcon", <>
  <circle cx="12" cy="12" r="7" />
  <circle cx="12" cy="12" r="3" />
  <line x1="2" y1="12" x2="22" y2="12" />
</>);

// Mechanizm korbowy (tarcza + ramię korby)
const CranksetIcon = createBikeIcon("CranksetIcon", <>
  <circle cx="10" cy="10" r="7" />
  <circle cx="10" cy="10" r="2" />
  <line x1="10" y1="10" x2="19" y2="20" strokeWidth="2.5" />
  <circle cx="19" cy="20" r="1.5" />
</>);

// Kaseta (zębatka z zębami + mniejsze koła)
const CassetteIcon = createBikeIcon("CassetteIcon", <>
  <circle cx="12" cy="12" r="8" />
  <path d="M12 4 L12 2 M17.7 6.3 L19.1 4.9 M20 12 L22 12 M17.7 17.7 L19.1 19.1 M12 20 L12 22 M6.3 17.7 L4.9 19.1 M4 12 L2 12 M6.3 6.3 L4.9 4.9" />
  <circle cx="12" cy="12" r="5" />
  <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
</>);

// Przerzutka tył (ramię + dwa kółka jockey + cage)
const RearDerailleurIcon = createBikeIcon("RearDerailleurIcon", <>
  <path d="M4 2 L8 7 L8 11" strokeWidth="1.5" />
  <circle cx="8" cy="13.5" r="2.5" />
  <line x1="8" y1="16" x2="16" y2="18" />
  <circle cx="16" cy="20" r="2.5" />
</>);

// Klamkomanetki / manetki (dźwignia hamulcowo-przerzutkowa)
const ShiftersIcon = createBikeIcon("ShiftersIcon", <>
  <rect x="7" y="3" width="10" height="10" rx="2" />
  <line x1="13" y1="13" x2="10" y2="22" strokeWidth="2.5" />
</>);

// Pedały (platforma z teksturą + oś)
const PedalsIcon = createBikeIcon("PedalsIcon", <>
  <rect x="2" y="8" width="20" height="8" rx="2" />
  <line x1="12" y1="8" x2="12" y2="2" strokeWidth="2.5" />
  <line x1="7" y1="9" x2="7" y2="15" strokeWidth="1" />
  <line x1="17" y1="9" x2="17" y2="15" strokeWidth="1" />
</>);

// Bloki SPD (płytka z bolcami i klipsem)
const CleatsIcon = createBikeIcon("CleatsIcon", <>
  <rect x="6" y="8" width="12" height="11" rx="2" />
  <circle cx="9" cy="14" r="1" fill="currentColor" stroke="none" />
  <circle cx="15" cy="14" r="1" fill="currentColor" stroke="none" />
  <path d="M8 8 L12 4 L16 8" />
</>);

// Klocki hamulcowe (pad z powierzchnią cierną i sprężyną)
const BrakePadIcon = createBikeIcon("BrakePadIcon", <>
  <rect x="6" y="6" width="12" height="14" rx="3" />
  <line x1="10" y1="6" x2="10" y2="20" />
  <circle cx="14" cy="10" r="1" fill="currentColor" stroke="none" />
  <circle cx="14" cy="16" r="1" fill="currentColor" stroke="none" />
  <path d="M10 6 L12 2 L14 6" />
</>);

// Linki (kabel z końcówkami)
const CableIcon = createBikeIcon("CableIcon", <>
  <path d="M4 4 Q4 12 12 12 Q20 12 20 20" />
  <circle cx="4" cy="4" r="1.5" fill="currentColor" stroke="none" />
  <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none" />
</>);

// Opona (koło z oponą, obręczą i piastą)
const BikeTireIcon = createBikeIcon("BikeTireIcon", <>
  <circle cx="12" cy="12" r="10" strokeWidth="3" />
  <circle cx="12" cy="12" r="5.5" strokeWidth="1.5" />
  <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
</>);

// Dętka (okrąg z wentylkiem)
const InnerTubeIcon = createBikeIcon("InnerTubeIcon", <>
  <circle cx="12" cy="14" r="7" strokeWidth="3.5" />
  <line x1="12" y1="7" x2="12" y2="3" strokeWidth="2" />
  <circle cx="12" cy="2" r="1.5" />
</>);

// Piasty (korpus z kołnierzami i osią)
const HubIcon = createBikeIcon("HubIcon", <>
  <rect x="7" y="7" width="10" height="10" rx="3" />
  <line x1="2" y1="12" x2="22" y2="12" />
  <line x1="6" y1="5" x2="6" y2="19" strokeWidth="2" />
  <line x1="18" y1="5" x2="18" y2="19" strokeWidth="2" />
</>);

// Szprychy (linie promieniowe z piastą)
const SpokesIcon = createBikeIcon("SpokesIcon", <>
  <circle cx="12" cy="12" r="2" />
  <line x1="12" y1="2" x2="12" y2="10" />
  <line x1="12" y1="14" x2="12" y2="22" />
  <line x1="2" y1="12" x2="10" y2="12" />
  <line x1="14" y1="12" x2="22" y2="12" />
  <line x1="5" y1="5" x2="9.2" y2="9.2" />
  <line x1="14.8" y1="14.8" x2="19" y2="19" />
</>);

// Kierownica (drop bar / baranek - widok z przodu)
const HandlebarIcon = createBikeIcon("HandlebarIcon", <>
  <line x1="8" y1="4" x2="16" y2="4" />
  <path d="M8 4 C3 4 2 8 2 13 C2 18 5 20 9 20" />
  <path d="M16 4 C21 4 22 8 22 13 C22 18 19 20 15 20" />
</>);

// Mostek (clamp na sterowniku + extension do kierownicy)
const StemIcon = createBikeIcon("StemIcon", <>
  <rect x="3" y="5" width="7" height="14" rx="2" />
  <rect x="10" y="8" width="12" height="8" rx="2" />
</>);

// Owijka kierownicy (rura z owiniętą taśmą)
const HandlebarTapeIcon = createBikeIcon("HandlebarTapeIcon", <>
  <line x1="3" y1="12" x2="21" y2="12" strokeWidth="5" />
  <line x1="7" y1="8" x2="9" y2="16" strokeWidth="1.5" />
  <line x1="11" y1="8" x2="13" y2="16" strokeWidth="1.5" />
  <line x1="15" y1="8" x2="17" y2="16" strokeWidth="1.5" />
</>);

// Siodło (widok z góry - kształt gruszki)
const SaddleIcon = createBikeIcon("SaddleIcon", <>
  <path d="M12 2 Q8 9 5 15 Q7 22 12 22 Q17 22 19 15 Q16 9 12 2" />
</>);

// Koszyk na bidon (U-kształtna klatka)
const BottleCageIcon = createBikeIcon("BottleCageIcon", <>
  <path d="M7 2 L5 8 L5 20 Q5 22 7 22 L17 22 Q19 22 19 20 L19 8 L17 2" />
  <line x1="5" y1="14" x2="19" y2="14" />
</>);

// Mapowanie typów części na komponenty ikon
export const PART_ICON_COMPONENTS: Partial<Record<PartType, LucideIcon>> = {
  // Rama i widelec
  [PartType.FRAME]: BikeFrameIcon,
  [PartType.FORK]: BikeForkIcon,
  [PartType.SUSPENSION_FORK]: Mountain,
  // Stery i suport
  [PartType.BOTTOM_BRACKET]: BottomBracketIcon,
  // Napęd
  [PartType.CRANKSET]: CranksetIcon,
  [PartType.CHAIN]: Link,
  [PartType.CASSETTE]: CassetteIcon,
  [PartType.DERAILLEUR_REAR]: RearDerailleurIcon,
  [PartType.SHIFTERS]: ShiftersIcon,
  [PartType.PEDALS]: PedalsIcon,
  [PartType.CLEATS]: CleatsIcon,
  [PartType.SHIFT_CABLES]: CableIcon,
  // Hamulce
  [PartType.PADS_FRONT]: BrakePadIcon,
  [PartType.PADS_REAR]: BrakePadIcon,
  [PartType.BRAKE_CABLES]: CableIcon,
  [PartType.BRAKE_FLUID]: Droplet,
  // Koła
  [PartType.HUBS]: HubIcon,
  [PartType.SPOKES]: SpokesIcon,
  [PartType.TIRE_FRONT]: BikeTireIcon,
  [PartType.TIRE_REAR]: BikeTireIcon,
  [PartType.INNER_TUBE_FRONT]: InnerTubeIcon,
  [PartType.INNER_TUBE_REAR]: InnerTubeIcon,
  [PartType.TUBELESS_SEALANT_FRONT]: Droplet,
  [PartType.TUBELESS_SEALANT_REAR]: Droplet,
  // Cockpit
  [PartType.STEM]: StemIcon,
  [PartType.HANDLEBAR]: HandlebarIcon,
  [PartType.HANDLEBAR_TAPE]: HandlebarTapeIcon,
  // Siodło
  [PartType.SADDLE]: SaddleIcon,
  [PartType.SUSPENSION_SEATPOST]: Mountain,
  [PartType.DROPPER_POST]: ChevronUp,
  // Akcesoria
  [PartType.BOTTLE_CAGE]: BottleCageIcon,
  // Inne
  [PartType.LUBRICANT]: Droplet,
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

// Komponent PartIcon - renderuje SVG ikonę lub emoji fallback
export function PartIcon({
  type,
  className = "w-5 h-5",
}: {
  type: PartType;
  className?: string;
}): JSX.Element {
  const Component = PART_ICON_COMPONENTS[type];
  if (Component) {
    return <Component className={className} />;
  }
  return <span>{PART_ICONS[type] || ""}</span>;
}
