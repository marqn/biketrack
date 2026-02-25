"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { PartType } from "@/lib/generated/prisma";
import {
  PART_CATEGORIES,
  PART_NAMES,
  PART_ICONS,
  type PartCategory,
} from "@/lib/default-parts";
import {
  savePartsDisplayOrder,
  resetPartsDisplayOrder,
  type PartsDisplayOrder,
  type DisplayCategory,
} from "@/app/app/actions/parts-display-order";
import { MAINTENANCE_ITEMS } from "@/lib/maintenance-config";
import { toast } from "sonner";

// Ikony kategorii
const CATEGORY_ICONS: Record<DisplayCategory, string> = {
  frame: "🖼️",
  drivetrain: "⚙️",
  brakes: "🛑",
  wheels: "⭕",
  cockpit: "🎛️",
  accessories: "🎒",
  maintenance: "🔧",
};

const DEFAULT_CATEGORY_ORDER: PartCategory[] = [
  "frame",
  "drivetrain",
  "brakes",
  "wheels",
  "cockpit",
  "accessories",
];

interface PartsOrderDialogProps {
  currentOrder: PartsDisplayOrder | null;
  hasMaintenance?: boolean;
  visibleParts: Record<PartCategory, Array<{ partType: PartType }>>;
  customParts?: Record<PartCategory, Array<{ id: string; name: string }>>;
}

function getCategoryLabel(cat: string): string {
  if (cat === "maintenance") return "Konserwacja roweru";
  return PART_CATEGORIES[cat as PartCategory]?.label ?? cat;
}

export default function PartsOrderDialog({
  currentOrder,
  hasMaintenance = false,
  visibleParts,
  customParts = {} as Record<PartCategory, Array<{ id: string; name: string }>>,
}: PartsOrderDialogProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  // State lokalne do edycji
  const [categoryOrder, setCategoryOrder] = React.useState<
    { id: string; label: string; icon: string }[]
  >([]);
  const [partsOrder, setPartsOrder] = React.useState<
    Record<string, { id: string; label: string; icon: string }[]>
  >({});
  const [selectedCategory, setSelectedCategory] =
    React.useState<DisplayCategory>("frame");

  // Inicjalizacja z currentOrder lub domyślnych wartości
  React.useEffect(() => {
    if (open) {
      const defaultOrder: DisplayCategory[] = [
        ...(hasMaintenance ? (["maintenance"] as const) : []),
        ...DEFAULT_CATEGORY_ORDER,
      ];
      const catOrder: DisplayCategory[] = currentOrder?.categories
        ? [
            // Zachowaj zapisaną kolejność, dołóż brakujące (np. nowo dodane)
            ...currentOrder.categories.filter(
              (c) => c !== "maintenance" || hasMaintenance
            ),
            ...(hasMaintenance && !currentOrder.categories.includes("maintenance")
              ? (["maintenance"] as const)
              : []),
          ]
        : defaultOrder;

      setCategoryOrder(
        catOrder.map((cat) => ({
          id: cat,
          label: getCategoryLabel(cat),
          icon: CATEGORY_ICONS[cat as DisplayCategory] ?? "🔧",
        }))
      );

      const parts: Record<
        string,
        { id: string; label: string; icon: string }[]
      > = {};

      // Standardowe kategorie części
      for (const cat of DEFAULT_CATEGORY_ORDER) {
        const visibleStandard = new Set(
          (visibleParts[cat] ?? []).map((p) => p.partType as string)
        );
        const catCustomParts = customParts[cat as PartCategory] ?? [];
        const customPartsMap = new Map(catCustomParts.map((cp) => [cp.id, cp.name]));
        const visibleCustomIds = new Set(catCustomParts.map((cp) => cp.id));

        const savedOrder = currentOrder?.parts?.[cat];
        const ordered: string[] = [];
        if (savedOrder) {
          for (const pt of savedOrder) {
            if (visibleStandard.has(pt) || visibleCustomIds.has(pt)) ordered.push(pt);
          }
        }
        for (const pt of visibleStandard) {
          if (!ordered.includes(pt)) ordered.push(pt);
        }
        for (const id of visibleCustomIds) {
          if (!ordered.includes(id)) ordered.push(id);
        }
        parts[cat] = ordered.map((pt) => ({
          id: pt,
          label: PART_NAMES[pt as keyof typeof PART_NAMES] ?? customPartsMap.get(pt) ?? pt,
          icon: PART_ICONS[pt as keyof typeof PART_ICONS] ?? "🔧",
        }));
      }

      // Kategoria konserwacji
      if (hasMaintenance) {
        const savedMaintenanceOrder = currentOrder?.parts?.["maintenance"] ?? [];
        const allTypes = MAINTENANCE_ITEMS.map((i) => i.type);
        const ordered = [
          ...savedMaintenanceOrder.filter((t) => allTypes.includes(t as typeof allTypes[number])),
          ...allTypes.filter((t) => !savedMaintenanceOrder.includes(t)),
        ];
        parts["maintenance"] = ordered.map((t) => {
          const item = MAINTENANCE_ITEMS.find((i) => i.type === t)!;
          return { id: t, label: item.label, icon: "🔧" };
        });
      }

      setPartsOrder(parts);
      setSelectedCategory(catOrder[0] ?? "frame");
    }
  }, [open, currentOrder, hasMaintenance]);

  async function handleSave() {
    setSaving(true);
    try {
      const order: PartsDisplayOrder = {
        categories: categoryOrder.map((c) => c.id as DisplayCategory),
        parts: Object.fromEntries(
          Object.entries(partsOrder).map(([cat, items]) => [
            cat,
            items.map((i) => i.id),
          ])
        ),
      };
      await savePartsDisplayOrder(order);
      router.refresh();
      setOpen(false);
      toast.success("Kolejność zapisana");
    } catch {
      toast.error("Nie udało się zapisać kolejności");
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setSaving(true);
    try {
      await resetPartsDisplayOrder();
      router.refresh();
      setOpen(false);
      toast.success("Przywrócono domyślną kolejność");
    } catch {
      toast.error("Nie udało się zresetować kolejności");
    } finally {
      setSaving(false);
    }
  }

  const currentParts = partsOrder[selectedCategory] ?? [];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <ArrowUpDown className="size-4" />
          Kolejność
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Kolejność wyświetlania</DialogTitle>
          <DialogDescription>
            Przeciągnij elementy, aby zmienić kolejność kategorii i części.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="categories" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="categories" className="flex-1">
              Kategorie
            </TabsTrigger>
            <TabsTrigger value="parts" className="flex-1">
              Części
            </TabsTrigger>
          </TabsList>

          <TabsContent value="categories" className="mt-4">
            <div
              className="custom-scrollbar space-y-1.5 overflow-y-auto -mx-6 pl-6 pr-8"
              style={{ maxHeight: "calc(90vh - 280px)" }}
            >
              <Sortable items={categoryOrder} onReorder={setCategoryOrder}>
                {categoryOrder.map((cat) => (
                  <SortableItem key={cat.id} id={cat.id}>
                    <span>
                      {cat.icon} {cat.label}
                    </span>
                  </SortableItem>
                ))}
              </Sortable>
            </div>
          </TabsContent>

          <TabsContent value="parts" className="mt-4 space-y-3">
            <Select
              value={selectedCategory}
              onValueChange={(v) => setSelectedCategory(v as DisplayCategory)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOrder.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.icon} {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div
              className="custom-scrollbar space-y-1.5 overflow-y-auto -mx-6 pl-6 pr-8"
              style={{ maxHeight: "calc(90vh - 340px)" }}
            >
              <Sortable
                items={currentParts}
                onReorder={(newItems) =>
                  setPartsOrder((prev) => ({
                    ...prev,
                    [selectedCategory]: newItems,
                  }))
                }
              >
                {currentParts.map((part) => (
                  <SortableItem key={part.id} id={part.id}>
                    <span>
                      {part.icon} {part.label}
                    </span>
                  </SortableItem>
                ))}
              </Sortable>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={saving || !currentOrder}
            className="gap-2"
          >
            <RotateCcw className="size-3.5" />
            Domyślna
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
