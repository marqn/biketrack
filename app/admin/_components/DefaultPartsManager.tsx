"use client";

import { useState, useTransition, useEffect } from "react";
import { PartType, BikeType } from "@/lib/generated/prisma";
import { DEFAULT_PARTS, PART_NAMES } from "@/lib/default-parts";
import { setDefaultParts } from "../_actions/bike-products";
import { searchPartProducts } from "../_actions/part-products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Check, Search } from "lucide-react";

interface PartProduct {
  id: string;
  type: PartType;
  brand: string;
  model: string;
}

interface DefaultPart {
  partType: PartType;
  partProductId: string | null;
  partProduct: { id: string; brand: string; model: string } | null;
  expectedKm: number;
}

interface DefaultPartsManagerProps {
  bikeProductId: string;
  bikeType: BikeType;
  currentParts: Array<{
    partType: PartType;
    partProductId: string;
    expectedKm: number;
    partProduct: { id: string; brand: string; model: string };
  }>;
}

export function DefaultPartsManager({
  bikeProductId,
  bikeType,
  currentParts,
}: DefaultPartsManagerProps) {
  const defaultPartTypes = DEFAULT_PARTS[bikeType];
  const [parts, setParts] = useState<DefaultPart[]>(() => {
    return defaultPartTypes.map((dp) => {
      const existing = currentParts.find((p) => p.partType === dp.type);
      return existing
        ? {
            partType: dp.type,
            partProductId: existing.partProductId,
            partProduct: existing.partProduct,
            expectedKm: existing.expectedKm,
          }
        : {
            partType: dp.type,
            partProductId: null,
            partProduct: null,
            expectedKm: dp.expectedKm,
          };
    });
  });
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    const partsToSave = parts
      .filter((p) => p.partProductId)
      .map((p) => ({
        partType: p.partType,
        partProductId: p.partProductId!,
        expectedKm: p.expectedKm,
      }));

    startTransition(async () => {
      await setDefaultParts(bikeProductId, partsToSave);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function updatePart(index: number, updates: Partial<DefaultPart>) {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], ...updates };
    setParts(newParts);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Domyslne czesci</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {parts.map((part, index) => (
          <PartRow
            key={part.partType}
            part={part}
            onUpdate={(updates) => updatePart(index, updates)}
          />
        ))}
        <div className="flex gap-2 pt-4">
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Zapisywanie..." : "Zapisz czesci"}
          </Button>
          {saved && (
            <span className="flex items-center gap-1 text-sm text-green-600">
              <Check className="h-4 w-4" /> Zapisano
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function PartRow({
  part,
  onUpdate,
}: {
  part: DefaultPart;
  onUpdate: (updates: Partial<DefaultPart>) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PartProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const products = await searchPartProducts(part.partType, query);
      setResults(products);
      setIsSearching(false);
      setShowDropdown(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, part.partType]);

  function selectProduct(product: PartProduct) {
    onUpdate({
      partProductId: product.id,
      partProduct: { id: product.id, brand: product.brand, model: product.model },
    });
    setQuery("");
    setShowDropdown(false);
  }

  function clearProduct() {
    onUpdate({
      partProductId: null,
      partProduct: null,
    });
  }

  return (
    <div className="flex items-center gap-4 p-3 border rounded-lg">
      <div className="w-48 font-medium text-sm">
        {PART_NAMES[part.partType]}
      </div>

      <div className="flex-1 relative">
        {part.partProduct ? (
          <div className="flex items-center gap-2 p-2 bg-muted rounded">
            <span className="flex-1">
              {part.partProduct.brand} {part.partProduct.model}
            </span>
            <button
              type="button"
              onClick={clearProduct}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              placeholder="Szukaj czesci..."
              className="pl-9"
            />
            {showDropdown && results.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg max-h-48 overflow-auto">
                {results.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    className="w-full px-3 py-2 text-left hover:bg-muted text-sm"
                    onClick={() => selectProduct(product)}
                  >
                    {product.brand} {product.model}
                  </button>
                ))}
              </div>
            )}
            {showDropdown && query.length >= 2 && results.length === 0 && !isSearching && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-lg p-3 text-sm text-muted-foreground">
                Brak wynikow. Dodaj czesc w zakladce Czesci.
              </div>
            )}
          </div>
        )}
      </div>

      <div className="w-24">
        <Input
          type="number"
          value={part.expectedKm}
          onChange={(e) =>
            onUpdate({ expectedKm: parseInt(e.target.value) || 0 })
          }
          className="text-right"
        />
      </div>
      <span className="text-sm text-muted-foreground w-8">km</span>
    </div>
  );
}
