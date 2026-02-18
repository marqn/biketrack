"use client";

import * as React from "react";
import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { PartType } from "@/lib/generated/prisma";
import { PartProduct } from "@/lib/types";
import { searchBrands, searchModels, getPopularBrands } from "@/app/app/actions/search-brands";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

// Normalizacja marki: tylko pierwsza litera wielka, reszta bez zmian
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

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
  const [selectedBrandIndex, setSelectedBrandIndex] = useState(-1);
  const [selectedModelIndex, setSelectedModelIndex] = useState(-1);
  const [popularBrands, setPopularBrands] = useState<string[]>([]);
  const userChangedBrandRef = useRef(false);
  const brandInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);

  // Fetch popular brands on mount
  useEffect(() => {
    getPopularBrands(partType).then(setPopularBrands);
  }, [partType]);

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
        setSelectedBrandIndex(-1); // Reset selection
        setIsSearchingBrands(false);
      } else {
        setBrandSuggestions([]);
        setBrandNotFound(false);
        setLastBrandQuery("");
        setSelectedBrandIndex(-1);
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
      if (brand) {
        setIsSearchingModels(true);
        const results = await searchModels(partType, brand, model);
        setModelSuggestions(results);
        setLastModelQuery(model);
        setModelNotFound(results.length === 0);
        setSelectedModelIndex(-1); // Reset selection
        setIsSearchingModels(false);
      } else {
        setModelSuggestions([]);
        setModelNotFound(false);
        setLastModelQuery("");
        setSelectedModelIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [brand, model, partType]);

  // Reset model state only when user manually changes brand
  useEffect(() => {
    if (userChangedBrandRef.current) {
      userChangedBrandRef.current = false;
      setModelSuggestions([]);
      setModelNotFound(false);
      setLastModelQuery("");
      onModelChange("");
      onProductSelect(null);
    }
  }, [brand]);

  const handleClearBrand = () => {
    userChangedBrandRef.current = true;
    onBrandChange("");
    onProductSelect(null);
    setBrandSuggestions([]);
    setBrandNotFound(false);
    setLastBrandQuery("");
    setSelectedBrandIndex(-1);
    setTimeout(() => brandInputRef.current?.focus(), 0);
  };

  const handleClearModel = () => {
    onModelChange("");
    onProductSelect(null);
    setModelSuggestions([]);
    setModelNotFound(false);
    setLastModelQuery("");
    setSelectedModelIndex(-1);
    setTimeout(() => modelInputRef.current?.focus(), 0);
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
          userChangedBrandRef.current = true;
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

  const triggerModelSearch = async () => {
    if (!brand || isSearchingModels) return;
    setIsSearchingModels(true);
    const results = await searchModels(partType, brand, model);
    setModelSuggestions(results);
    setModelNotFound(results.length === 0);
    setLastModelQuery(model);
    setSelectedModelIndex(-1);
    setIsSearchingModels(false);
  };

  const handleModelKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // ArrowDown na pustym polu z wybraną marką: otwórz dropdown z modelami
    if (e.key === "ArrowDown" && brand && (!showModelSuggestions || modelSuggestions.length === 0)) {
      e.preventDefault();
      setShowModelSuggestions(true);
      if (modelSuggestions.length === 0 && !isSearchingModels) {
        triggerModelSearch();
      }
      return;
    }

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
      {/* Brand field */}
      <div className="space-y-2 relative">
        <Label htmlFor="brand">
          Marka <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Input
            id="brand"
            ref={brandInputRef}
            placeholder="np. Continental, Shimano, SRAM"
            value={brand}
            onChange={(e) => {
              const newBrand = e.target.value;
              userChangedBrandRef.current = true;
              onBrandChange(newBrand);
              onProductSelect(null);
              setShowBrandSuggestions(true);

              // Reset brandNotFound tylko gdy użytkownik skraca query lub zmienia kierunek
              if (!newBrand.toLowerCase().startsWith(lastBrandQuery.toLowerCase()) || newBrand.length < lastBrandQuery.length) {
                setBrandNotFound(false);
                setLastBrandQuery("");
              }
            }}
            onKeyDown={handleBrandKeyDown}
            onFocus={() => setShowBrandSuggestions(true)}
            onBlur={() => {
              setTimeout(() => setShowBrandSuggestions(false), 200);
              if (brand) onBrandChange(capitalizeFirst(brand));
            }}
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
          <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto custom-scrollbar">
            {brandSuggestions.map((brandName, index) => (
              <button
                key={brandName}
                type="button"
                className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                  index === selectedBrandIndex
                    ? "bg-accent"
                    : "hover:bg-accent"
                }`}
                onMouseDown={() => {
                  userChangedBrandRef.current = true;
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

        {/* Popular brands badges */}
        {!brand && popularBrands.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {popularBrands.map((brandName) => (
              <Badge
                key={brandName}
                variant="secondary"
                className="cursor-pointer hover:bg-secondary/80"
                onClick={() => {
                  userChangedBrandRef.current = true;
                  onBrandChange(brandName);
                  setShowBrandSuggestions(false);
                  setTimeout(() => modelInputRef.current?.focus(), 0);
                }}
              >
                {brandName}
              </Badge>
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
            ref={modelInputRef}
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
            onKeyDown={handleModelKeyDown}
            onFocus={() => {
              setShowModelSuggestions(true);
              if (brand && modelSuggestions.length === 0 && !isSearchingModels) {
                triggerModelSearch();
              }
            }}
            onBlur={() => {
              setTimeout(() => setShowModelSuggestions(false), 200);
              if (model) onModelChange(capitalizeFirst(model));
            }}
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
        {showModelSuggestions && brand && (
          <>
            {isSearchingModels && modelSuggestions.length === 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md p-3">
                <span className="text-sm text-muted-foreground">Szukam modeli...</span>
              </div>
            )}
            {modelSuggestions.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-60 overflow-y-auto custom-scrollbar">
                {modelSuggestions.map((product, index) => (
                  <button
                    key={product.id}
                    type="button"
                    className={`w-full px-3 py-2 text-left transition-colors ${
                      index === selectedModelIndex
                        ? "bg-accent"
                        : "hover:bg-accent"
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
          </>
        )}
      </div>
    </div>
  );
}