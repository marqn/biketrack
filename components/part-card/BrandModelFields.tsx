"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { PartType } from "@/lib/generated/prisma";
import { PartProduct } from "@/lib/types";
import { searchBrands, searchModels } from "@/app/app/actions/search-brands";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BrandModelFieldsProps {
  partType: PartType;
  brand: string;
  model: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onProductSelect: (product: PartProduct | null) => void;
}

export default function BrandModelFields({
  partType,
  brand,
  model,
  onBrandChange,
  onModelChange,
  onProductSelect,
}: BrandModelFieldsProps) {
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<PartProduct[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [isSearchingBrands, setIsSearchingBrands] = useState(false);
  const [isSearchingModels, setIsSearchingModels] = useState(false);
  const [lastBrandQuery, setLastBrandQuery] = useState("");
  const [lastModelQuery, setLastModelQuery] = useState("");
  const [brandNotFound, setBrandNotFound] = useState(false);
  const [modelNotFound, setModelNotFound] = useState(false);

  // Search brands
  useEffect(() => {
    // Jeśli już wiemy że marka nie istnieje i użytkownik tylko dodaje znaki, nie szukaj ponownie
    if (brandNotFound && brand.startsWith(lastBrandQuery) && brand.length > lastBrandQuery.length) {
      return;
    }

    const timer = setTimeout(async () => {
      if (brand.length >= 1) {
        setIsSearchingBrands(true);
        const results = await searchBrands(partType, brand);
        setBrandSuggestions(results);
        setLastBrandQuery(brand);
        setBrandNotFound(results.length === 0);
        setIsSearchingBrands(false);
      } else {
        setBrandSuggestions([]);
        setBrandNotFound(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, partType, brandNotFound, lastBrandQuery]);

  // Search models
  useEffect(() => {
    // Jeśli już wiemy że model nie istnieje i użytkownik tylko dodaje znaki, nie szukaj ponownie
    if (modelNotFound && model.startsWith(lastModelQuery) && model.length > lastModelQuery.length) {
      return;
    }

    const timer = setTimeout(async () => {
      if (brand && model.length >= 1) {
        setIsSearchingModels(true);
        const results = await searchModels(partType, brand, model);
        setModelSuggestions(results);
        setLastModelQuery(model);
        setModelNotFound(results.length === 0);
        setIsSearchingModels(false);
      } else {
        setModelSuggestions([]);
        setModelNotFound(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, model, partType, modelNotFound, lastModelQuery]);

  return (
    <div className="space-y-4">
      {/* Brand field */}
      <div className="space-y-2 relative">
        <Label htmlFor="brand">
          Marka <span className="text-destructive">*</span>
        </Label>
        <Input
          id="brand"
          placeholder="np. Continental, Shimano, SRAM"
          value={brand}
          onChange={(e) => {
            onBrandChange(e.target.value);
            onProductSelect(null);
            setShowBrandSuggestions(true);
            setBrandNotFound(false); // Reset gdy użytkownik zmienia input
          }}
          onFocus={() => setShowBrandSuggestions(true)}
          onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
        />

        {/* Brand suggestions dropdown */}
        {showBrandSuggestions && brandSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
            {brandSuggestions.map((brandName) => (
              <button
                key={brandName}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent text-sm"
                onMouseDown={() => {
                  onBrandChange(brandName);
                  setShowBrandSuggestions(false);
                }}
              >
                {brandName}
              </button>
            ))}
          </div>
        )}

        {brand && brandSuggestions.length === 0 && !isSearchingBrands && (
          <p className="text-xs text-muted-foreground">
            💡 Nowa marka - zostanie dodana do bazy
          </p>
        )}
      </div>

      {/* Model field */}
      <div className="space-y-2 relative">
        <Label htmlFor="model">
          Model <span className="text-destructive">*</span>
        </Label>
        <Input
          id="model"
          placeholder="np. GP5000, XT CN-M8100"
          value={model}
          onChange={(e) => {
            onModelChange(e.target.value);
            onProductSelect(null);
            setShowModelSuggestions(true);
            setModelNotFound(false); // Reset gdy użytkownik zmienia input
          }}
          onFocus={() => setShowModelSuggestions(true)}
          onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
          disabled={!brand}
        />

        {/* Model suggestions dropdown */}
        {showModelSuggestions && modelSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
            {modelSuggestions.map((product) => (
              <button
                key={product.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-accent"
                onMouseDown={() => {
                  onModelChange(product.model);
                  onProductSelect(product);
                  setShowModelSuggestions(false);
                }}
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium">{product.model}</span>
                  {product.averageRating !== null &&
                    product.averageRating > 0 &&
                    product.totalReviews > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ⭐ {product.averageRating.toFixed(1)} (
                        {product.totalReviews}{" "}
                        {product.totalReviews === 1 ? "opinia" : "opinii"})
                      </span>
                    )}
                </div>
              </button>
            ))}
          </div>
        )}

        {brand && model && modelSuggestions.length === 0 && !isSearchingModels && (
          <p className="text-xs text-muted-foreground">
            💡 Nowy model - zostanie dodany do bazy
          </p>
        )}
      </div>
    </div>
  );
}
