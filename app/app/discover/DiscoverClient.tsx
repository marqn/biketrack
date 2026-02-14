"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";
import { BikeType } from "@/lib/generated/prisma";
import { BikeCard } from "@/components/discover/BikeCard";
import { getPublicBikes } from "@/app/app/actions/discover/get-public-bikes";

type BikeData = {
  slug: string | null;
  brand: string | null;
  model: string | null;
  year: number | null;
  type: BikeType;
  isElectric: boolean;
  totalKm: number;
  images: string[];
  imageUrl: string | null;
  user: { name: string | null; image: string | null };
  _count: { comments: number };
};

export function DiscoverClient() {
  const [bikes, setBikes] = useState<BikeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "mostKm" | "mostComments">("newest");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadBikes = async () => {
    setLoading(true);
    const result = await getPublicBikes({
      page,
      pageSize: 12,
      type: typeFilter === "ALL" ? null : (typeFilter as BikeType),
      search,
      sortBy,
    });

    if (result.success) {
      setBikes(result.bikes as BikeData[]);
      setTotalPages(result.totalPages);
      setTotalCount(result.totalCount);
    }
    setLoading(false);
  };

  useEffect(() => {
    setPage(1);
  }, [search, typeFilter, sortBy]);

  useEffect(() => {
    loadBikes();
  }, [page, search, typeFilter, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadBikes();
  };

  return (
    <div className="space-y-6">
      {/* Filtry */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleSearch} className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Szukaj marki lub modelu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </form>

        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Typ roweru" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Wszystkie</SelectItem>
            {Object.entries(bikeTypeLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Sortowanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Najnowsze</SelectItem>
            <SelectItem value="mostKm">Najwięcej km</SelectItem>
            <SelectItem value="mostComments">Najaktywniejsze</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Liczba wyników */}
      {!loading && (
        <p className="text-sm text-muted-foreground">
          {totalCount === 0
            ? "Brak wyników"
            : `${totalCount} ${totalCount === 1 ? "rower" : "rowerów"}`}
        </p>
      )}

      {/* Grid rowerów */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-card rounded-xl border overflow-hidden animate-pulse"
            >
              <div className="w-full h-36 bg-muted" />
              <div className="p-4 space-y-2">
                <div className="h-5 bg-muted rounded w-3/4" />
                <div className="h-4 bg-muted rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bikes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bikes.map((bike) => (
            <BikeCard key={bike.slug} bike={bike} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Brak publicznych rowerów</p>
          <p className="text-sm mt-1">
            Ustaw swój rower jako publiczny, aby pojawił się tutaj!
          </p>
        </div>
      )}

      {/* Paginacja */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} z {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  );
}
