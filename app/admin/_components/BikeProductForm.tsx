"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BikeType } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import NumberStepper from "@/components/ui/number-stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createBikeProduct,
  updateBikeProduct,
  deleteBikeProduct,
} from "../_actions/bike-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageUploader } from "@/components/ui/image-uploader";

const bikeTypeLabels: Record<BikeType, string> = {
  ROAD: "Szosowy",
  GRAVEL: "Gravel",
  MTB: "MTB",
  OTHER: "Inny",
  TRAINER: "Trenażer",
};

interface BikeProductFormProps {
  initialData?: {
    id: string;
    bikeType: BikeType;
    brand: string;
    model: string;
    year?: number | null;
    description?: string | null;
    officialImageUrl?: string | null;
    isElectric?: boolean;
    isPublic?: boolean;
  };
}

export function BikeProductForm({ initialData }: BikeProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [bikeType, setBikeType] = useState<BikeType>(
    initialData?.bikeType || BikeType.ROAD
  );
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [year, setYear] = useState(initialData?.year?.toString() || new Date().getFullYear().toString());
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [isElectric, setIsElectric] = useState(initialData?.isElectric ?? false);
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [officialImageUrl, setOfficialImageUrl] = useState<string | null>(
    initialData?.officialImageUrl || null
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const data = {
        bikeType,
        brand,
        model,
        year: year ? parseInt(year, 10) : null,
        description: description || null,
        isElectric,
        isPublic,
      };

      if (initialData) {
        await updateBikeProduct(initialData.id, data);
        router.refresh();
      } else {
        const product = await createBikeProduct(data);
        router.push(`/admin/bikes/${product.id}`);
      }
    });
  }

  function handleDelete() {
    if (!initialData) return;
    if (!confirm("Czy na pewno chcesz usunac ten rower?")) return;

    startTransition(async () => {
      await deleteBikeProduct(initialData.id);
      router.push("/admin/bikes");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edytuj rower" : "Nowy rower"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bikeType">Typ roweru</Label>
            <Select
              value={bikeType}
              onValueChange={(v) => setBikeType(v as BikeType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(BikeType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {bikeTypeLabels[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                placeholder="np. Cannondale"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                placeholder="np. Topstone Carbon 1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Rok modelowy</Label>
            <NumberStepper
              value={year ? parseInt(year, 10) : new Date().getFullYear()}
              onChange={(v) => setYear(v.toString())}
              steps={[1]}
              min={1990}
              max={new Date().getFullYear() + 1}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcjonalny opis roweru..."
              rows={3}
            />
          </div>

          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="isElectric"
                checked={isElectric}
                onCheckedChange={setIsElectric}
              />
              <Label htmlFor="isElectric">E-bike (elektryczny)</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="isPublic"
                checked={isPublic}
                onCheckedChange={setIsPublic}
              />
              <Label htmlFor="isPublic">Widoczny w katalogu</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
            {initialData && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Usun
              </Button>
            )}
          </div>
        </form>

        {initialData && (
          <div className="mt-6 space-y-2">
            <Label>Zdjęcie roweru</Label>
            <ImageUploader
              images={officialImageUrl ? [officialImageUrl] : []}
              maxImages={1}
              entityType="bikeproduct"
              entityId={initialData.id}
              onImagesChange={(urls) => setOfficialImageUrl(urls[0] || null)}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
