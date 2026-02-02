"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PartType } from "@/lib/generated/prisma";
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
  createPartProduct,
  updatePartProduct,
  deletePartProduct,
} from "../_actions/part-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PART_NAMES } from "@/lib/default-parts";

interface PartProductFormProps {
  initialData?: {
    id: string;
    type: PartType;
    brand: string;
    model: string;
    description?: string | null;
    officialImageUrl?: string | null;
    officialPrice?: number | string | null;
  };
}

export function PartProductForm({ initialData }: PartProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [partType, setPartType] = useState<PartType>(
    initialData?.type || PartType.CHAIN
  );
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [description, setDescription] = useState(
    initialData?.description || ""
  );
  const [imageUrl, setImageUrl] = useState(initialData?.officialImageUrl || "");
  const [price, setPrice] = useState(
    initialData?.officialPrice?.toString() || ""
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const data = {
        type: partType,
        brand,
        model,
        description: description || null,
        officialImageUrl: imageUrl || null,
        officialPrice: price ? parseFloat(price) : null,
      };

      if (initialData) {
        await updatePartProduct(initialData.id, data);
        router.refresh();
      } else {
        const product = await createPartProduct(data);
        router.push(`/admin/parts/${product.id}`);
      }
    });
  }

  function handleDelete() {
    if (!initialData) return;
    if (!confirm("Czy na pewno chcesz usunac ta czesc?")) return;

    startTransition(async () => {
      await deletePartProduct(initialData.id);
      router.push("/admin/parts");
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edytuj czesc" : "Nowa czesc"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="partType">Typ czesci</Label>
            <Select
              value={partType}
              onValueChange={(v) => setPartType(v as PartType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PartType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {PART_NAMES[type]}
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
                placeholder="np. Shimano"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                required
                placeholder="np. CN-HG901"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Cena (PLN)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="np. 199.99"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Opis</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Opcjonalny opis czesci..."
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
