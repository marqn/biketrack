"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
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
    // Inteligentne cachowanie: jeśli poprzednie zapytanie nie zwróciło wyników
    // i obecne query jest rozszerzeniem poprzedniego, nie wysyłaj zapytania
    if (brandNotFound && lastBrandQuery && brand.toLowerCase().startsWith(lastBrandQuery.toLowerCase()) && brand.length > lastBrandQuery.length) {
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
        setLastBrandQuery("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, partType]);

  // Search models
  useEffect(() => {
    // Inteligentne cachowanie: jeśli poprzednie zapytanie nie zwróciło wyników
    // i obecne query jest rozszerzeniem poprzedniego, nie wysyłaj zapytania
    if (modelNotFound && lastModelQuery && model.toLowerCase().startsWith(lastModelQuery.toLowerCase()) && model.length > lastModelQuery.length) {
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
        setLastModelQuery("");
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, model, partType]);

  // Reset model state when brand changes
  useEffect(() => {
    setModelSuggestions([]);
    setModelNotFound(false);
    setLastModelQuery("");
    onModelChange("");
    onProductSelect(null);
  }, [brand]);

  const handleClearBrand = () => {
    onBrandChange("");
    onProductSelect(null);
    setBrandSuggestions([]);
    setBrandNotFound(false);
    setLastBrandQuery("");
  };

  const handleClearModel = () => {
    onModelChange("");
    onProductSelect(null);
    setModelSuggestions([]);
    setModelNotFound(false);
    setLastModelQuery("");
  };

  return (
    <div className="space-y-4">
      {/* Brand field */}
      <div className="space-y-2 relative">
        <Label htmlFor="brand">
          Marka <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="brand"
            placeholder="np. Continental, Shimano, SRAM"
            value={brand}
            onChange={(e) => {
              const newBrand = e.target.value;
              onBrandChange(newBrand);
              onProductSelect(null);
              setShowBrandSuggestions(true);
              
              // Reset brandNotFound tylko gdy użytkownik skraca query lub zmienia kierunek
              if (!newBrand.toLowerCase().startsWith(lastBrandQuery.toLowerCase()) || newBrand.length < lastBrandQuery.length) {
                setBrandNotFound(false);
                setLastBrandQuery("");
              }
            }}
            onFocus={() => setShowBrandSuggestions(true)}
            onBlur={() => setTimeout(() => setShowBrandSuggestions(false), 200)}
            className="pr-8"
          />
          {brand && (
            <button
              type="button"
              onClick={handleClearBrand}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

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
      </div>

      {/* Model field */}
      <div className="space-y-2 relative">
        <Label htmlFor="model">
          Model <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="model"
            placeholder="np. GP5000, XT CN-M8100"
            value={model}
            onChange={(e) => {
              const newModel = e.target.value;
              onModelChange(newModel);
              onProductSelect(null);
              setShowModelSuggestions(true);
              
              // Reset modelNotFound tylko gdy użytkownik skraca query lub zmienia kierunek
              if (!newModel.toLowerCase().startsWith(lastModelQuery.toLowerCase()) || newModel.length < lastModelQuery.length) {
                setModelNotFound(false);
                setLastModelQuery("");
              }
            }}
            onFocus={() => setShowModelSuggestions(true)}
            onBlur={() => setTimeout(() => setShowModelSuggestions(false), 200)}
            disabled={!brand}
            className="pr-8"
          />
          {model && (
            <button
              type="button"
              onClick={handleClearModel}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!brand}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

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
      </div>
    </div>
  );
}