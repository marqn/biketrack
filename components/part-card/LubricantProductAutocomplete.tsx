"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PartProduct } from "@/lib/types";
import {
  searchLubricantBrands,
  searchLubricantModels,
} from "@/app/app/actions/search-lubricants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LubricantProductAutocompleteProps {
  brand: string;
  model: string;
  onBrandChange: (brand: string) => void;
  onModelChange: (model: string) => void;
  onProductSelect: (product: PartProduct | null) => void;
}

export default function LubricantProductAutocomplete({
  brand,
  model,
  onBrandChange,
  onModelChange,
  onProductSelect,
}: LubricantProductAutocompleteProps) {
  const [brandSuggestions, setBrandSuggestions] = useState<string[]>([]);
  const [modelSuggestions, setModelSuggestions] = useState<PartProduct[]>([]);
  const [showBrandSuggestions, setShowBrandSuggestions] = useState(false);
  const [showModelSuggestions, setShowModelSuggestions] = useState(false);
  const [lastBrandQuery, setLastBrandQuery] = useState("");
  const [lastModelQuery, setLastModelQuery] = useState("");
  const [brandNotFound, setBrandNotFound] = useState(false);
  const [modelNotFound, setModelNotFound] = useState(false);
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(-1);
  const [selectedModelIndex, setSelectedModelIndex] = useState(-1);
  const prevBrandRef = useRef(brand);
  const isInitialMount = useRef(true);

  // Wyszukaj marki
  useEffect(() => {
    if (
      brandNotFound &&
      lastBrandQuery &&
      brand.toLowerCase().startsWith(lastBrandQuery.toLowerCase()) &&
      brand.length > lastBrandQuery.length
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      if (brand.length >= 1) {
        const results = await searchLubricantBrands(brand);
        setBrandSuggestions(results);
        setLastBrandQuery(brand);
        setBrandNotFound(results.length === 0);
        setSelectedBrandIndex(-1);
      } else {
        setBrandSuggestions([]);
        setBrandNotFound(false);
        setLastBrandQuery("");
        setSelectedBrandIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand]);

  // Wyszukaj modele
  useEffect(() => {
    if (
      modelNotFound &&
      lastModelQuery &&
      model.toLowerCase().startsWith(lastModelQuery.toLowerCase()) &&
      model.length > lastModelQuery.length
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      if (brand && model.length >= 1) {
        const results = await searchLubricantModels(brand, model);
        setModelSuggestions(results);
        setLastModelQuery(model);
        setModelNotFound(results.length === 0);
        setSelectedModelIndex(-1);
      } else {
        setModelSuggestions([]);
        setModelNotFound(false);
        setLastModelQuery("");
        setSelectedModelIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, model]);

  // Resetuj model gdy zmieni się marka (ale nie przy inicjalizacji)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevBrandRef.current = brand;
      return;
    }

    // Resetuj tylko gdy brand naprawdę się zmienił
    if (prevBrandRef.current !== brand) {
      setModelSuggestions([]);
      setModelNotFound(false);
      setLastModelQuery("");
      onModelChange("");
      onProductSelect(null);
      prevBrandRef.current = brand;
    }
  }, [brand]);

  const handleClearBrand = () => {
    onBrandChange("");
    onProductSelect(null);
    setBrandSuggestions([]);
    setBrandNotFound(false);
    setLastBrandQuery("");
    setSelectedBrandIndex(-1);
  };

  const handleClearModel = () => {
    onModelChange("");
    onProductSelect(null);
    setModelSuggestions([]);
    setModelNotFound(false);
    setLastModelQuery("");
    setSelectedModelIndex(-1);
  };

  const handleBrandKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showBrandSuggestions || brandSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedBrandIndex((prev) =>
          prev < brandSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedBrandIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedBrandIndex >= 0) {
          onBrandChange(brandSuggestions[selectedBrandIndex]);
          setShowBrandSuggestions(false);
          setSelectedBrandIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowBrandSuggestions(false);
        setSelectedBrandIndex(-1);
        break;
    }
  };

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showModelSuggestions || modelSuggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedModelIndex((prev) =>
          prev < modelSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedModelIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedModelIndex >= 0) {
          const product = modelSuggestions[selectedModelIndex];
          onModelChange(product.model);
          onProductSelect(product);
          setShowModelSuggestions(false);
          setSelectedModelIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowModelSuggestions(false);
        setSelectedModelIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-4">
      {/* Pole marki */}
      <div className="space-y-2 relative">
        <Label htmlFor="lubricant-brand">Marka</Label>
        <div className="relative">
          <Input
            id="lubricant-brand"
            placeholder="np. Squirt, Muc-Off, Finish Line"
            value={brand}
            onChange={(e) => {
              const newBrand = e.target.value;
              onBrandChange(newBrand);
              onProductSelect(null);
              setShowBrandSuggestions(true);

              if (
                !newBrand.toLowerCase().startsWith(lastBrandQuery.toLowerCase()) ||
                newBrand.length < lastBrandQuery.length
              ) {
                setBrandNotFound(false);
                setLastBrandQuery("");
              }
            }}
            onKeyDown={handleBrandKeyDown}
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

        {/* Dropdown marki */}
        {showBrandSuggestions && brandSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
            {brandSuggestions.map((brandName, index) => (
              <button
                key={brandName}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  index === selectedBrandIndex ? "bg-accent" : "hover:bg-accent"
                }`}
                onMouseDown={() => {
                  onBrandChange(brandName);
                  setShowBrandSuggestions(false);
                  setSelectedBrandIndex(-1);
                }}
                onMouseEnter={() => setSelectedBrandIndex(index)}
              >
                {brandName}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Pole modelu */}
      <div className="space-y-2 relative">
        <Label htmlFor="lubricant-model">Model / Nazwa</Label>
        <div className="relative">
          <Input
            id="lubricant-model"
            placeholder="np. Long Lasting Dry Lube"
            value={model}
            onChange={(e) => {
              const newModel = e.target.value;
              onModelChange(newModel);
              onProductSelect(null);
              setShowModelSuggestions(true);

              if (
                !newModel.toLowerCase().startsWith(lastModelQuery.toLowerCase()) ||
                newModel.length < lastModelQuery.length
              ) {
                setModelNotFound(false);
                setLastModelQuery("");
              }
            }}
            onKeyDown={handleModelKeyDown}
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

        {/* Dropdown modeli */}
        {showModelSuggestions && modelSuggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto">
            {modelSuggestions.map((product, index) => (
              <button
                key={product.id}
                type="button"
                className={`w-full px-3 py-2 text-left transition-colors ${
                  index === selectedModelIndex ? "bg-accent" : "hover:bg-accent"
                }`}
                onMouseDown={() => {
                  onModelChange(product.model);
                  onProductSelect(product);
                  setShowModelSuggestions(false);
                  setSelectedModelIndex(-1);
                }}
                onMouseEnter={() => setSelectedModelIndex(index)}
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
