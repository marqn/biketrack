"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { searchLubricantBrands } from "@/app/app/actions/search-lubricants";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LubricantBrandAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  label?: string;
  placeholder?: string;
}

export default function LubricantBrandAutocomplete({
  value,
  onChange,
  id = "lubricant-brand",
  label = "Marka smaru/wosku",
  placeholder = "np. Squirt, Muc-Off, Finish Line",
}: LubricantBrandAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [lastQuery, setLastQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  useEffect(() => {
    // Inteligentne cachowanie: jeśli poprzednie zapytanie nie zwróciło wyników
    // i obecne query jest rozszerzeniem poprzedniego, nie wysyłaj zapytania
    if (
      notFound &&
      lastQuery &&
      value.toLowerCase().startsWith(lastQuery.toLowerCase()) &&
      value.length > lastQuery.length
    ) {
      return;
    }

    const timer = setTimeout(async () => {
      if (value.length >= 1) {
        setIsSearching(true);
        const results = await searchLubricantBrands(value);
        setSuggestions(results);
        setLastQuery(value);
        setNotFound(results.length === 0);
        setSelectedIndex(-1);
        setIsSearching(false);
      } else {
        setSuggestions([]);
        setNotFound(false);
        setLastQuery("");
        setSelectedIndex(-1);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  const handleClear = () => {
    onChange("");
    setSuggestions([]);
    setNotFound(false);
    setLastQuery("");
    setSelectedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0) {
          onChange(suggestions[selectedIndex]);
          setShowSuggestions(false);
          setSelectedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  return (
    <div className="space-y-2 relative">
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        <Input
          id={id}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            const newValue = e.target.value;
            onChange(newValue);
            setShowSuggestions(true);

            // Reset notFound tylko gdy użytkownik skraca query lub zmienia kierunek
            if (
              !newValue.toLowerCase().startsWith(lastQuery.toLowerCase()) ||
              newValue.length < lastQuery.length
            ) {
              setNotFound(false);
              setLastQuery("");
            }
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          className="pr-8"
        />
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-popover border rounded-md shadow-md max-h-48 overflow-y-auto">
          {suggestions.map((brandName, index) => (
            <button
              key={brandName}
              type="button"
              className={`w-full px-3 py-2 text-left text-sm transition-colors ${
                index === selectedIndex ? "bg-accent" : "hover:bg-accent"
              }`}
              onMouseDown={() => {
                onChange(brandName);
                setShowSuggestions(false);
                setSelectedIndex(-1);
              }}
              onMouseEnter={() => setSelectedIndex(index)}
            >
              {brandName}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
