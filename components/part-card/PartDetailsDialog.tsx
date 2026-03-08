"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { BikeType, PartType } from "@/lib/generated/prisma";
import { PartProduct, BikePartWithProduct } from "@/lib/types";
import { installPart } from "@/app/app/actions/install-part";
import { savePartReview } from "@/app/app/actions/save-part-review";
import { getUserPartReview } from "@/app/app/actions/get-user-part-review";
import { ImageUploader } from "@/components/ui/image-uploader";
import BrandModelFields from "./BrandModelFields";
import TireFields from "./specific-fields/TireFields";
import ChainFields from "./specific-fields/ChainFields";
import CassetteFields from "./specific-fields/CassetteFields";
import PadsFields from "./specific-fields/PadsFields";
import ForkFields from "./specific-fields/ForkFields";
import SeatpostFields from "./specific-fields/SeatpostFields";
import SpokesFields from "./specific-fields/SpokesFields";
import RimsFields from "./specific-fields/RimsFields";
import HubsFields from "./specific-fields/HubsFields";
import FrameFields from "./specific-fields/FrameFields";
import BottomBracketFields from "./specific-fields/BottomBracketFields";
import CranksetFields from "./specific-fields/CranksetFields";
import DerailleurRearFields from "./specific-fields/DerailleurRearFields";
import PedalsFields from "./specific-fields/PedalsFields";
import DiscFields from "./specific-fields/DiscFields";
import BrakeCaliperFields from "./specific-fields/BrakeCaliperFields";
import StemFields from "./specific-fields/StemFields";
import HeadsetFields from "./specific-fields/HeadsetFields";
import HandlebarFields from "./specific-fields/HandlebarFields";
import HandlebarTapeFields from "./specific-fields/HandlebarTapeFields";
import ShiftersFields from "./specific-fields/ShiftersFields";
import {
  getDefaultSpecificData,
  hasSpecificFields,
  TireSpecificData,
  ChainSpecificData,
  CassetteSpecificData,
  PadsSpecificData,
  ForkSpecificData,
  SeatpostSpecificData,
  SpokesSpecificData,
  RimsSpecificData,
  HubsSpecificData,
  FrameSpecificData,
  BottomBracketSpecificData,
  CranksetSpecificData,
  DerailleurRearSpecificData,
  PedalsSpecificData,
  DiscSpecificData,
  StemSpecificData,
  HeadsetSpecificData,
  HandlebarSpecificData,
  HandlebarTapeSpecificData,
  ShiftersSpecificData,
  BrakeCaliperSpecificData,
} from "@/lib/part-specific-data";

interface PartDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partType: PartType;
  partName: string;
  partId: string;
  mode: "create" | "edit" | "replace" | "view";
  currentPart?: Partial<BikePartWithProduct> | null;
  bikeType?: BikeType;
  // Opcjonalne - dla edycji PartReplacement z historii
  onSave?: (data: {
    brand?: string;
    model?: string;
    notes?: string;
  }) => Promise<void>;
  initialBrand?: string;
  initialModel?: string;
  initialNotes?: string;
}

export default function PartDetailsDialog({
  open,
  onOpenChange,
  partType,
  partName,
  partId,
  mode,
  currentPart,
  bikeType,
  onSave,
  initialBrand,
  initialModel,
  initialNotes,
}: PartDetailsDialogProps) {
  const [selectedProduct, setSelectedProduct] = useState<PartProduct | null>(
    null,
  );
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [installedAt, setInstalledAt] = useState<string>("");
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [partSpecificData, setPartSpecificData] = useState<
    Record<string, unknown>
  >(getDefaultSpecificData(partType) as Record<string, unknown>);
  const [unknownProduct, setUnknownProduct] = useState(false);
  const [oldPartRating, setOldPartRating] = useState(0);
  const [oldPartHoveredRating, setOldPartHoveredRating] = useState(0);
  const [oldPartReviewText, setOldPartReviewText] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isLoadingReview, setIsLoadingReview] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();


  useEffect(() => {
    async function initDialog() {
      if (mode === "view" && currentPart?.product) {
        // Tryb podglądu - tylko do odczytu, edycja tylko opinii i zdjęcia
        setSelectedProduct(currentPart.product as PartProduct);
        setBrand(currentPart.product.brand);
        setModel(currentPart.product.model);
        setUnknownProduct(false);
        if (currentPart.installedAt) {
          setInstalledAt(format(new Date(currentPart.installedAt), "yyyy-MM-dd"));
        } else {
          setInstalledAt("");
        }
        if (currentPart.partSpecificData) {
          setPartSpecificData(currentPart.partSpecificData as Record<string, unknown>);
        } else {
          setPartSpecificData(getDefaultSpecificData(partType) as Record<string, unknown>);
        }
        if (currentPart.product.id) {
          setIsLoadingReview(true);
          try {
            const review = await getUserPartReview(currentPart.product.id);
            if (review) {
              setRating(review.rating);
              setReviewText(review.reviewText || "");
            } else {
              setRating(0);
              setReviewText("");
            }
          } finally {
            setIsLoadingReview(false);
          }
        } else {
          setRating(0);
          setReviewText("");
        }
      } else if (mode === "edit" && currentPart?.product) {
        // Tryb edycji - załaduj dane z currentPart
        setSelectedProduct(currentPart.product as PartProduct);
        setBrand(currentPart.product.brand);
        setModel(currentPart.product.model);
        setUnknownProduct(false);

        if (currentPart.installedAt) {
          const date = new Date(currentPart.installedAt);
          setInstalledAt(format(date, "yyyy-MM-dd"));
        } else {
          const today = new Date();
          setInstalledAt(format(today, "yyyy-MM-dd"));
        }

        if (currentPart.partSpecificData) {
          setPartSpecificData(
            currentPart.partSpecificData as Record<string, unknown>,
          );
        } else {
          setPartSpecificData(
            getDefaultSpecificData(partType) as Record<string, unknown>,
          );
        }

        // Załaduj opinię użytkownika z bazy danych
        if (currentPart.product.id) {
          setIsLoadingReview(true);
          try {
            const review = await getUserPartReview(currentPart.product.id);
            if (review) {
              setRating(review.rating);
              setReviewText(review.reviewText || "");
            } else {
              setRating(0);
              setReviewText("");
            }
          } finally {
            setIsLoadingReview(false);
          }
        } else {
          setRating(0);
          setReviewText("");
        }
      } else if (mode === "edit" && !currentPart?.product && currentPart?.installedAt) {
        // Tryb edycji części bez produktu (nieznana marka/model)
        setSelectedProduct(null);
        setBrand("");
        setModel("");
        setUnknownProduct(true);
        const date = new Date(currentPart.installedAt);
        setInstalledAt(format(date, "yyyy-MM-dd"));
        setPartSpecificData(
          getDefaultSpecificData(partType) as Record<string, unknown>,
        );
        setRating(0);
        setReviewText("");
      } else if (initialBrand || initialModel) {
        // Tryb edycji z initial values (np. z PartReplacement)
        setSelectedProduct(null);
        setBrand(initialBrand || "");
        setModel(initialModel || "");
        setUnknownProduct(false);
        const today = new Date();
        setInstalledAt(format(today, "yyyy-MM-dd"));
        setPartSpecificData(
          getDefaultSpecificData(partType) as Record<string, unknown>,
        );
        setRating(0);
        setReviewText(initialNotes || "");
      } else if (mode === "replace" && currentPart?.product) {
        // Tryb wymiany - załaduj ocenę starej części, wyczyść pola nowej
        setSelectedProduct(null);
        setBrand("");
        setModel("");
        setUnknownProduct(false);
        const today = new Date();
        setInstalledAt(format(today, "yyyy-MM-dd"));
        setPartSpecificData(
          getDefaultSpecificData(partType) as Record<string, unknown>,
        );
        setRating(0);
        setReviewText("");
        // Załaduj istniejącą ocenę starej części
        if (currentPart.product.id) {
          setIsLoadingReview(true);
          try {
            const review = await getUserPartReview(currentPart.product.id);
            if (review) {
              setOldPartRating(review.rating);
              setOldPartReviewText(review.reviewText || "");
            } else {
              setOldPartRating(0);
              setOldPartReviewText("");
            }
          } finally {
            setIsLoadingReview(false);
          }
        } else {
          setOldPartRating(0);
          setOldPartReviewText("");
        }
      } else {
        // Tryb create - wyczyść wszystko
        setSelectedProduct(null);
        setBrand("");
        setModel("");
        setUnknownProduct(false);
        const today = new Date();
        setInstalledAt(format(today, "yyyy-MM-dd"));
        setPartSpecificData(
          getDefaultSpecificData(partType) as Record<string, unknown>,
        );
        setRating(0);
        setReviewText("");
        setOldPartRating(0);
        setOldPartReviewText("");
      }
      setHoveredRating(0);
      setOldPartHoveredRating(0);
    }

    if (open) {
      initDialog();
    }
  }, [
    open,
    mode,
    currentPart,
    partType,
    initialBrand,
    initialModel,
    initialNotes,
  ]);

  async function handleSave() {
    if (mode === "view") {
      startTransition(async () => {
        try {
          if (rating > 0 && selectedProduct?.id) {
            await savePartReview({
              partId,
              productId: selectedProduct.id,
              rating,
              reviewText: reviewText.trim() || undefined,
            });
          }
          onOpenChange(false);
          router.refresh();
        } catch (error) {
          console.error("Error saving review:", error);
          alert("Wystąpił błąd podczas zapisywania opinii");
        }
      });
      return;
    }

    if (!unknownProduct && (!brand.trim() || !model.trim())) {
      alert("Proszę podać markę i model");
      return;
    }

    startTransition(async () => {
      try {
        if (onSave) {
          // Użyj zewnętrznego handlera (np. dla edycji PartReplacement)
          await onSave({
            brand: brand.trim(),
            model: model.trim(),
            notes: reviewText.trim() || undefined,
          });
        } else {
          await installPart({
            partId,
            productId: selectedProduct?.id,
            brand: brand.trim(),
            model: model.trim(),
            installedAt: installedAt ? new Date(installedAt) : undefined,
            partSpecificData: hasSpecificFields(partType)
              ? partSpecificData
              : undefined,
            rating: rating > 0 ? rating : undefined,
            reviewText: reviewText.trim() || undefined,
            mode,
            unknownProduct,
            saveToGarage: mode === "replace" ? true : undefined,
            oldPartRating: mode === "replace" && oldPartRating > 0 ? oldPartRating : undefined,
            oldPartReviewText: mode === "replace" ? oldPartReviewText.trim() || undefined : undefined,
          });
        }
        onOpenChange(false);
        router.refresh();
      } catch (error) {
        console.error("Error saving part:", error);
        alert("Wystąpił błąd podczas zapisywania");
      }
    });
  }

  function renderSpecificFields() {
    if (!hasSpecificFields(partType)) return null;

    switch (partType) {
      case PartType.FRAME:
        return (
          <FrameFields
            data={partSpecificData as Partial<FrameSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
            bikeType={bikeType}
          />
        );
      case PartType.TIRE_FRONT:
      case PartType.TIRE_REAR:
        return (
          <TireFields
            data={partSpecificData as Partial<TireSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.CHAIN:
        return (
          <ChainFields
            data={partSpecificData as Partial<ChainSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.CASSETTE:
        return (
          <CassetteFields
            data={partSpecificData as Partial<CassetteSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.PADS_FRONT:
      case PartType.PADS_REAR:
        return (
          <PadsFields
            data={partSpecificData as Partial<PadsSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.DISC_FRONT:
      case PartType.DISC_REAR:
        return (
          <DiscFields
            data={partSpecificData as Partial<DiscSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.BRAKE_CALIPER_FRONT:
      case PartType.BRAKE_CALIPER_REAR:
        return (
          <BrakeCaliperFields
            data={partSpecificData as Partial<BrakeCaliperSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.FORK:
        return (
          <ForkFields
            data={partSpecificData as Partial<ForkSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.SEATPOST:
        return (
          <SeatpostFields
            data={partSpecificData as Partial<SeatpostSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.SPOKES:
        return (
          <SpokesFields
            data={partSpecificData as Partial<SpokesSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.RIMS:
        return (
          <RimsFields
            data={partSpecificData as Partial<RimsSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.HUBS:
        return (
          <HubsFields
            data={partSpecificData as Partial<HubsSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.BOTTOM_BRACKET:
        return (
          <BottomBracketFields
            data={partSpecificData as Partial<BottomBracketSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.CRANKSET:
        return (
          <CranksetFields
            data={partSpecificData as Partial<CranksetSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.DERAILLEUR_REAR:
        return (
          <DerailleurRearFields
            data={partSpecificData as Partial<DerailleurRearSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.SHIFTERS:
        return (
          <ShiftersFields
            data={partSpecificData as Partial<ShiftersSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
            showClassicOption={bikeType === BikeType.ROAD}
          />
        );
      case PartType.PEDALS:
        return (
          <PedalsFields
            data={partSpecificData as Partial<PedalsSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.STEM:
        return (
          <StemFields
            data={partSpecificData as Partial<StemSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.HEADSET:
        return (
          <HeadsetFields
            data={partSpecificData as Partial<HeadsetSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.HANDLEBAR:
        return (
          <HandlebarFields
            data={partSpecificData as Partial<HandlebarSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      case PartType.HANDLEBAR_TAPE:
        return (
          <HandlebarTapeFields
            data={partSpecificData as Partial<HandlebarTapeSpecificData>}
            onChange={(data) =>
              setPartSpecificData(data as Record<string, unknown>)
            }
          />
        );
      default:
        return null;
    }
  }

  const title = mode === "view"
    ? "Szczegóły"
    : mode === "edit"
      ? "Edytuj szczegóły"
      : mode === "replace"
        ? "Wymień"
        : "Dodaj szczegóły";

  const description = mode === "view"
    ? "Zdjęcie i opinia (marka i model tylko do odczytu)"
    : mode === "replace"
      ? "Oceń wymienianą część i podaj dane nowej"
      : "Określ model części oraz jej parametry użytkowe";

  const formContent = (
    <div
      className="custom-scrollbar space-y-6 overflow-y-auto px-4 md:px-0 md:-mx-6 md:pl-6 md:pr-8 pb-4"
      style={{ maxHeight: isMobile ? "calc(85vh - 160px)" : "calc(90vh - 200px)" }}
    >

          {/* === Tryb podglądu: marka/model/data tylko do odczytu === */}
          {mode === "view" && (
            <div className="space-y-2">
              <h3 className="text-base font-semibold">Zainstalowana część</h3>
              <div className="rounded-md border p-3 bg-muted/30">
                <p className="font-medium">{brand} {model}</p>
                {installedAt && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Zainstalowano:{" "}
                    {format(new Date(installedAt), "d MMMM yyyy", { locale: pl })}
                  </p>
                )}
                {currentPart?.wearKm != null && currentPart.wearKm > 0 && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Przejechała: <span className="font-medium text-foreground">{currentPart.wearKm.toLocaleString("pl-PL")} km</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {/* === Ocena wymienianej (starej) części === */}
          {mode === "replace" && currentPart?.product && (
            <div className="space-y-3 rounded-md border border-muted bg-muted/20 p-4">
              <div>
                <h3 className="text-base font-semibold">
                  Ocena wymienianej części
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentPart.product.brand} {currentPart.product.model}
                  {currentPart.wearKm != null && currentPart.wearKm > 0 && (
                    <> · {currentPart.wearKm.toLocaleString("pl-PL")} km</>
                  )}
                  {isLoadingReview && (
                    <span className="ml-2 text-xs">Ładowanie...</span>
                  )}
                </p>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setOldPartRating(star)}
                    onMouseEnter={() => setOldPartHoveredRating(star)}
                    onMouseLeave={() => setOldPartHoveredRating(0)}
                    className="text-2xl transition-colors focus:outline-none"
                  >
                    {star <= (oldPartHoveredRating || oldPartRating) ? (
                      <span className="text-yellow-500">★</span>
                    ) : (
                      <span className="text-muted-foreground">☆</span>
                    )}
                  </button>
                ))}
              </div>
              {oldPartRating > 0 && (
                <Textarea
                  placeholder="Co sądzisz o tej części po tym czasie?"
                  value={oldPartReviewText}
                  onChange={(e) => setOldPartReviewText(e.target.value)}
                  rows={2}
                />
              )}
            </div>
          )}

          {/* === Podstawowe informacje === */}
          {mode !== "view" && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Podstawowe informacje</h3>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="unknown-product"
                  checked={unknownProduct}
                  onCheckedChange={(checked) => {
                    setUnknownProduct(checked === true);
                    if (checked) {
                      setBrand("");
                      setModel("");
                      setSelectedProduct(null);
                      setRating(0);
                      setReviewText("");
                    }
                  }}
                />
                <Label
                  htmlFor="unknown-product"
                  className="text-sm font-normal cursor-pointer"
                >
                  Nie znam marki i modelu
                </Label>
              </div>

              {!unknownProduct && (
                <BrandModelFields
                  partType={partType}
                  brand={brand}
                  model={model}
                  onBrandChange={(newBrand) => { setBrand(newBrand); setSelectedProduct(null); }}
                  onModelChange={(newModel) => { setModel(newModel); setSelectedProduct(null); }}
                  onProductSelect={(product) => {
                    setSelectedProduct(product);
                    if (product && product.specifications) {
                      setPartSpecificData(
                        product.specifications as Record<string, unknown>,
                      );
                    }
                  }}
                />
              )}
            </div>
          )}

          {/* === Zdjęcie części === */}
          {!unknownProduct && selectedProduct && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold">Zdjęcie</h3>
              <ImageUploader
                images={selectedProduct.images || []}
                maxImages={3}
                entityType="product"
                entityId={selectedProduct.id}
                onImagesChange={(urls) => {
                  setSelectedProduct({
                    ...selectedProduct,
                    images: urls,
                  });
                }}
              />
            </div>
          )}

          {/* === Data montażu === */}
          {mode !== "view" && <div className="space-y-4">
            <h3 className="text-base font-semibold">Data montażu</h3>
            {isMobile ? (
              <div className="relative">
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !installedAt && "text-muted-foreground",
                  )}
                  onClick={() => document.getElementById("installedAtInput")?.click()}
                  type="button"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {installedAt
                    ? format(new Date(installedAt), "d MMMM yyyy", { locale: pl })
                    : "Wybierz datę"}
                </Button>
                <input
                  id="installedAtInput"
                  type="date"
                  value={installedAt}
                  max={format(new Date(), "yyyy-MM-dd")}
                  onChange={(e) => setInstalledAt(e.target.value)}
                  className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                />
              </div>
            ) : (
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !installedAt && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {installedAt
                      ? format(new Date(installedAt), "d MMMM yyyy", {
                          locale: pl,
                        })
                      : "Wybierz datę"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={installedAt ? new Date(installedAt) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setInstalledAt(format(date, "yyyy-MM-dd"));
                      }
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    locale={pl}
                  />
                </PopoverContent>
              </Popover>
            )}
          </div>}

          {/* === Specyficzne pola dla typu części === */}
          {mode !== "view" && (() => {
            const fields = renderSpecificFields();
            if (!fields) return null;
            return (
              <Accordion
                type="single"
                collapsible
                defaultValue={
                  mode === "edit" && currentPart?.partSpecificData
                    ? "specific-fields"
                    : undefined
                }
              >
                <AccordionItem value="specific-fields" className="border p-2">
                  <AccordionTrigger className="cursor-pointer text-base font-semibold">
                    Szczegółowe parametry (opcjonalne / zalecane)
                  </AccordionTrigger>
                  <AccordionContent>{fields}</AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })()}
          {/* === Opinia === */}
          {!unknownProduct && mode !== "replace" && (
            mode === "create" ? (
              <Collapsible>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-base font-semibold hover:text-foreground/80 transition-colors">
                  <span>Znasz już tę część? Dodaj ocenę od razu</span>
                  <ChevronDown className="h-4 w-4 transition-transform duration-200 in-data-[state=open]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-4 pt-3">
                  <p className="text-sm text-muted-foreground">
                    Jeśli montowałeś/aś tę część wcześniej i masz o niej zdanie — możesz dodać ocenę teraz.
                  </p>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoveredRating(star)}
                        onMouseLeave={() => setHoveredRating(0)}
                        className="text-2xl transition-colors focus:outline-none"
                      >
                        {star <= (hoveredRating || rating) ? (
                          <span className="text-yellow-500">★</span>
                        ) : (
                          <span className="text-muted-foreground">☆</span>
                        )}
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <Textarea
                      placeholder="Twoje wrażenia, trwałość, awaryjność…"
                      value={reviewText}
                      onChange={(e) => setReviewText(e.target.value)}
                      rows={3}
                    />
                  )}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <div className="space-y-4">
                <h3 className="text-base font-semibold">
                  Opinia (opcjonalnie)
                  {isLoadingReview && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      Ładowanie...
                    </span>
                  )}
                </h3>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="text-2xl transition-colors focus:outline-none"
                    >
                      {star <= (hoveredRating || rating) ? (
                        <span className="text-yellow-500">★</span>
                      ) : (
                        <span className="text-muted-foreground">☆</span>
                      )}
                    </button>
                  ))}
                </div>
                <Textarea
                  placeholder="Twoje wrażenia, trwałość, awaryjność…"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={3}
                />
              </div>
            )
          )}
    </div>
  );

  const footerButtons = (
    <>
      <Button variant="ghost" onClick={() => onOpenChange(false)}>
        Anuluj
      </Button>
      <Button onClick={handleSave} disabled={isPending}>
        {isPending ? "Zapisuję..." : mode === "view" ? "Zapisz opinię" : "Zapisz"}
      </Button>
    </>
  );

  return (
    <>
      <Dialog open={!isMobile && open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader className="shrink-0">
            <DialogTitle className="py-2">{title}: {partName}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
          {formContent}
          <DialogFooter className="shrink-0">
            {footerButtons}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Drawer open={isMobile && open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title}: {partName}</DrawerTitle>
            <p className="text-sm text-muted-foreground">{description}</p>
          </DrawerHeader>
          {formContent}
          <DrawerFooter>
            {footerButtons}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
