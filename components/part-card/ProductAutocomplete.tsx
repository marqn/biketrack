"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PartType } from "@/lib/generated/prisma";
import { searchProducts } from "@/app/actions/search-products";
import { PartProduct } from "@/lib/types";
import {
  Combobox,
  ComboboxInput,
  ComboboxContent,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@/components/ui/combobox";

interface ProductAutocompleteProps {
  partType: PartType;
  value: string;
  onProductSelect: (product: PartProduct | null) => void;
  onManualInput: (value: string) => void;
  placeholder?: string;
}

export default function ProductAutocomplete({
  partType,
  value,
  onProductSelect,
  onManualInput,
  placeholder = "Wpisz markę lub model...",
}: ProductAutocompleteProps) {
  const [inputValue, setInputValue] = useState(value);
  const [products, setProducts] = useState<PartProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (inputValue.length >= 2) {
        setIsSearching(true);
        const results = await searchProducts(partType, inputValue);
        setProducts(results);
        setIsSearching(false);
      } else {
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [inputValue, partType]);

  return (
    <div className="space-y-2">
      <Combobox
        value={inputValue}
        onValueChange={(newValue) => {
          setInputValue(newValue);
          onManualInput(newValue);
        }}
      >
        <ComboboxInput placeholder={placeholder} showClear showTrigger />
        <ComboboxContent>
          <ComboboxList>
            <ComboboxEmpty>
              {isSearching
                ? "Szukam..."
                : inputValue.length >= 2
                ? "Brak wyników - wpisz dalej aby dodać nowy produkt"
                : "Wpisz przynajmniej 2 znaki"}
            </ComboboxEmpty>
            {products.map((product) => (
              <ComboboxItem
                key={product.id}
                value={`${product.brand} ${product.model}`}
                onSelect={() => {
                  onProductSelect(product);
                  setInputValue(`${product.brand} ${product.model}`);
                }}
              >
                <div className="flex flex-col flex-1">
                  <span className="font-medium">
                    {product.brand} {product.model}
                  </span>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {product.averageRating !== null &&
                      product.averageRating > 0 &&
                      product.totalReviews > 0 && (
                        <span>
                          ⭐ {product.averageRating.toFixed(1)} (
                          {product.totalReviews}{" "}
                          {product.totalReviews === 1 ? "opinia" : "opinii"})
                        </span>
                      )}
                    <Link
                      href={`/app/products/${product.id}/reviews`}
                      className="text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Zobacz opinie
                    </Link>
                  </div>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {inputValue && products.length === 0 && !isSearching && (
        <p className="text-xs text-muted-foreground">
          💡 Nie znaleziono produktu - zostanie dodany jako nowy
        </p>
      )}
    </div>
  );
}
