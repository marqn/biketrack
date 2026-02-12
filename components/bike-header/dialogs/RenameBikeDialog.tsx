"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BikeType } from "@/lib/generated/prisma";
import { bikeTypeLabels, BikeProduct } from "@/lib/types";
import BikeBrandModelFields from "@/components/bike/BikeBrandModelFields";
import { toggleBikeVisibility } from "@/app/app/actions/toggle-bike-visibility";
import {
  uploadBikeImage,
  removeBikeImage,
} from "@/app/app/actions/upload-bike-image";
import { Camera, Copy, Check, X } from "lucide-react";
import Link from "next/link";
import { VisibilityButton } from "@/components/icon/visibility-button/VisibilityButton";

interface RenameBikeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bike: {
    id: string;
    brand?: string | null;
    model?: string | null;
    year?: number | null;
    type: BikeType;
    isElectric?: boolean;
    description?: string | null;
    isPublic?: boolean;
    slug?: string | null;
    imageUrl?: string | null;
  };
  onSave: (data: {
    brand: string;
    model: string;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    description: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

export function RenameBikeDialog({
  open,
  onOpenChange,
  bike,
  onSave,
}: RenameBikeDialogProps) {
  const [brand, setBrand] = useState(bike.brand ?? "");
  const [model, setModel] = useState(bike.model ?? "");
  const [year, setYear] = useState(
    bike.year?.toString() ?? new Date().getFullYear().toString(),
  );
  const [type, setType] = useState<BikeType>(bike.type);
  const [isElectric, setIsElectric] = useState(bike.isElectric ?? false);
  const [description, setDescription] = useState(bike.description ?? "");
  const [isPublic, setIsPublic] = useState(bike.isPublic ?? false);
  const [bikeImage, setBikeImage] = useState<string | null>(
    bike.imageUrl ?? null,
  );

  const [isLoading, setIsLoading] = useState(false);
  const [visibilityLoading, setVisibilityLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [visibilitySlug, setVisibilitySlug] = useState<string | null>(
    bike.slug ?? null,
  );

  const handleVisibilityChange = async (checked: boolean) => {
    setVisibilityLoading(true);
    setIsPublic(checked);
    try {
      const result = await toggleBikeVisibility(bike.id, checked);
      if (!result.success) {
        setIsPublic(!checked); // revert on error
      } else if (result.slug) {
        setVisibilitySlug(result.slug);
      }
    } catch {
      setIsPublic(!checked); // revert on error
    } finally {
      setVisibilityLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setBikeImage(base64);
      await uploadBikeImage(bike.id, base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = async () => {
    setBikeImage(null);
    await removeBikeImage(bike.id);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const result = await onSave({
        brand,
        model,
        year: year ? parseInt(year, 10) : null,
        type,
        isElectric,
        description,
      });

      if (result.success) {
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Błąd:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset formularza gdy dialog się otwiera
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setBrand(bike.brand ?? "");
      setModel(bike.model ?? "");
      setYear(bike.year?.toString() ?? "");
      setType(bike.type);
      setIsElectric(bike.isElectric ?? false);
      setDescription(bike.description ?? "");
      setIsPublic(bike.isPublic ?? false);
      setVisibilitySlug(bike.slug ?? null);
      setBikeImage(bike.imageUrl ?? null);
    }
    onOpenChange(open);
  };

  const handleProductSelect = (product: BikeProduct | null) => {
    if (product?.year) {
      setYear(product.year.toString());
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh]">
        <DialogHeader className="shrink-0">
          <DialogTitle>Edytuj rower</DialogTitle>
          <DialogDescription>
            Typ roweru jest wymagany. Marka i model są opcjonalne, ale pomagają
            w dopasowaniu komponentów.
          </DialogDescription>
        </DialogHeader>

        <div
          className="custom-scrollbar space-y-4 overflow-y-auto -mx-6 pl-6 pr-8"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          <div className="flex gap-4 items-end">
            <div className="space-y-2">
              <Label htmlFor="bike-type">
                Typ roweru <span className="text-destructive">*</span>
              </Label>
              <Select
                value={type}
                onValueChange={(value) => setType(value as BikeType)}
                disabled={isLoading}
              >
                <SelectTrigger id="bike-type" className="w-36">
                  <SelectValue placeholder="Wybierz typ" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(bikeTypeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bike-year">Rok</Label>
              <Input
                id="bike-year"
                type="number"
                placeholder="2023"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                min={1990}
                max={new Date().getFullYear() + 1}
                disabled={isLoading}
                className="w-24"
              />
            </div>

            {type !== BikeType.TRAINER && (
              <div className="flex items-center space-x-2 pb-2">
                <Checkbox
                  id="is-electric"
                  checked={isElectric}
                  onCheckedChange={(checked) => setIsElectric(checked === true)}
                  disabled={isLoading}
                />
                <Label
                  htmlFor="is-electric"
                  className="cursor-pointer whitespace-nowrap"
                >
                  E-bike
                </Label>
              </div>
            )}
          </div>

          <BikeBrandModelFields
            brand={brand}
            model={model}
            onBrandChange={setBrand}
            onModelChange={setModel}
            onProductSelect={handleProductSelect}
          />

          <div className="space-y-2">
            <Label htmlFor="bike-description">Opisz swój rower</Label>
            <Textarea
              id="bike-description"
              placeholder="np. Mój główny rower do codziennych dojazdów, z dodatkowym oświetleniem i sakwami..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              maxLength={500}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Twój opis będzie widoczny dla innych użytkowników. Pochwal się
              swoim setupem, opisz modyfikacje lub podziel się tym, co sprawia
              że ten rower jest wyjątkowy. Inni będą mogli komentować i
              proponować ulepszenia!
            </p>
          </div>

          {/* Zdjęcie roweru */}
          <div className="space-y-2">
            <Label>Zdjęcie roweru</Label>
            <div className="flex items-center gap-4">
              <div className="relative w-32 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
                {bikeImage ? (
                  <>
                    <img
                      src={bikeImage}
                      alt="Rower"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </>
                ) : (
                  <label className="cursor-pointer flex flex-col items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
                    <Camera className="h-6 w-6" />
                    <span className="text-xs">Dodaj zdjęcie</span>
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              {bikeImage && (
                <label className="cursor-pointer text-sm text-primary hover:underline">
                  Zmień zdjęcie
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Widoczność publiczna */}
          <div
            className="rounded-lg border p-4 space-y-2 cursor-pointer"
            onClick={() => {
              if (!isLoading && !visibilityLoading) {
                handleVisibilityChange(!isPublic);
              }
            }}
          >
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <VisibilityButton
                    isVisible={isPublic}
                    onClick={() => setIsPublic((prev) => !prev)}
                  />

                  <Label htmlFor="bike-public" className="cursor-pointer">
                    {isPublic ? "Rower publiczny" : "Rower prywatny"}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Twój rower będzie widoczny w sekcji Odkrywaj. Inni użytkownicy
                  będą mogli oglądać jego części i komentować.
                </p>
              </div>
              <Switch
                id="bike-public"
                checked={isPublic}
                onCheckedChange={handleVisibilityChange}
                disabled={isLoading || visibilityLoading}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            {visibilityLoading && (
              <p className="text-xs text-muted-foreground">Zapisywanie...</p>
            )}
            {isPublic && visibilitySlug && !visibilityLoading && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                Rower jest publiczny: <Link
                  className="text-xs text-blue-600"
                  href={`/app/discover/bike/${visibilitySlug}`}
                  onClick={(e) => { e.stopPropagation(); onOpenChange(false); }}
                >
                  /app/discover/bike/{visibilitySlug}
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(`${window.location.origin}/app/discover/bike/${visibilitySlug}`);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                </button>
              </p>
            )}
            {!isPublic && !visibilityLoading && visibilitySlug && (
              <p className="text-xs text-yellow-400">
                Rower jest niewidoczny dla innych.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="shrink-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
