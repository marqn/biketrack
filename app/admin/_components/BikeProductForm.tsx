"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BikeType } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createBikeProduct,
  updateBikeProduct,
  deleteBikeProduct,
} from "../_actions/bike-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const bikeTypeLabels: Record<BikeType, string> = {
  ROAD: "Szosowy",
  GRAVEL: "Gravel",
  MTB: "MTB",
  OTHER: "Inny",
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
  const [year, setYear] = useState(initialData?.year?.toString() || "2026");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [imageUrl, setImageUrl] = useState(initialData?.officialImageUrl || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const data = {
        bikeType,
        brand,
        model,
        year: year ? parseInt(year, 10) : null,
        description: description || null,
        officialImageUrl: imageUrl || null,
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
            <Label htmlFor="year">Rok modelowy</Label>
            <Input
              id="year"
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="np. 2024"
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

          <div className="space-y-2">
            <Label htmlFor="imageUrl">URL obrazka</Label>
            <Input
              id="imageUrl"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2 pt-4">
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
      </CardContent>
    </Card>
  );
}
