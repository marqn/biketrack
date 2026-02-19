"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
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
  PART_ICONS,
  type PartCategory,
} from "@/lib/default-parts";
import {
  savePartsDisplayOrder,
  resetPartsDisplayOrder,
  type PartsDisplayOrder,
} from "@/app/actions/parts-display-order";
import { toast } from "sonner";

// Ikony kategorii
const CATEGORY_ICONS: Record<PartCategory, string> = {
  frame: "🖼️",
  drivetrain: "⚙️",
  brakes: "🛑",
  wheels: "⭕",
  cockpit: "🎛️",
  accessories: "🎒",
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
  visibleParts: Record<PartCategory, Array<{ partType: PartType }>>;
}

export default function PartsOrderDialog({
  currentOrder,
  visibleParts,
}: PartsOrderDialogProps) {
  const t = useTranslations();
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
    React.useState<PartCategory>("frame");

  // Inicjalizacja z currentOrder lub domyślnych wartości
  React.useEffect(() => {
    if (open) {
      const catOrder = currentOrder?.categories ?? DEFAULT_CATEGORY_ORDER;
      setCategoryOrder(
        catOrder.map((cat) => ({
          id: cat,
          label: t(`partCategories.${cat}`),
          icon: CATEGORY_ICONS[cat],
        }))
      );

      const parts: Record<
        string,
        { id: string; label: string; icon: string }[]
      > = {};
      for (const cat of DEFAULT_CATEGORY_ORDER) {
        // Tylko części widoczne dla aktualnego roweru
        const visibleTypes = new Set(
          (visibleParts[cat] ?? []).map((p) => p.partType as string)
        );
        const savedOrder = currentOrder?.parts?.[cat];
        // Zacznij od zapisanej kolejności (filtrując do widocznych), potem dołóż brakujące
        const ordered: string[] = [];
        if (savedOrder) {
          for (const pt of savedOrder) {
            if (visibleTypes.has(pt)) ordered.push(pt);
          }
        }
        for (const pt of visibleTypes) {
          if (!ordered.includes(pt)) ordered.push(pt);
        }
        parts[cat] = ordered.map((pt) => ({
          id: pt,
          label: t(`parts.partNames.${pt}`),
          icon: PART_ICONS[pt as keyof typeof PART_ICONS] ?? "",
        }));
      }
      setPartsOrder(parts);
      setSelectedCategory(catOrder[0] ?? "frame");
    }
  }, [open, currentOrder]);

  async function handleSave() {
    setSaving(true);
    try {
      const order: PartsDisplayOrder = {
        categories: categoryOrder.map((c) => c.id as PartCategory),
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
      toast.success(t("parts.orderSaved"));
    } catch {
      toast.error(t("parts.orderSaveError"));
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
      toast.success(t("parts.orderReset"));
    } catch {
      toast.error(t("parts.orderResetError"));
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
          {t("parts.displayOrder")}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>{t("parts.displayOrderTitle")}</DialogTitle>
          <DialogDescription>
            {t("parts.displayOrderDescription")}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="categories" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="categories" className="flex-1">
              {t("parts.categoriesTab")}
            </TabsTrigger>
            <TabsTrigger value="parts" className="flex-1">
              {t("parts.partsTab")}
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
              onValueChange={(v) => setSelectedCategory(v as PartCategory)}
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
            {t("common.defaultOrder")}
          </Button>
          <Button onClick={handleSave} disabled={saving} size="sm">
            {saving ? t("common.saving") : t("common.save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
