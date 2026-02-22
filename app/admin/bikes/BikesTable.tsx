"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "../_components/DeleteButton";
import { ArrowUp, ArrowDown, ArrowUpDown, Pencil, ImageOff } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";

type SortKey = "brand" | "model" | "bikeType" | "year";
type SortDir = "asc" | "desc";

interface Product {
  id: string;
  brand: string;
  model: string;
  bikeType: string;
  year: number | null;
  officialImageUrl?: string | null;
  defaultParts: unknown[];
}

interface BikesTableProps {
  products: Product[];
  onDelete: (id: string) => Promise<void>;
}

export function BikesTable({ products, onDelete }: BikesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("brand");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "brand" || sortKey === "model") {
        cmp = (a[sortKey] || "").localeCompare(b[sortKey] || "", "pl");
      } else if (sortKey === "bikeType") {
        const labelA = bikeTypeLabels[a.bikeType as keyof typeof bikeTypeLabels] || a.bikeType;
        const labelB = bikeTypeLabels[b.bikeType as keyof typeof bikeTypeLabels] || b.bikeType;
        cmp = labelA.localeCompare(labelB, "pl");
      } else if (sortKey === "year") {
        cmp = (a.year ?? 0) - (b.year ?? 0);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [products, sortKey, sortDir]);

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="h-3 w-3 ml-1 opacity-40" />;
    return sortDir === "asc"
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />;
  }

  const headerClass = "cursor-pointer select-none hover:text-foreground";

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-14">Foto</TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("brand")}>
            <span className="inline-flex items-center">Marka <SortIcon column="brand" /></span>
          </TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("model")}>
            <span className="inline-flex items-center">Model <SortIcon column="model" /></span>
          </TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("bikeType")}>
            <span className="inline-flex items-center">Typ <SortIcon column="bikeType" /></span>
          </TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("year")}>
            <span className="inline-flex items-center">Rok <SortIcon column="year" /></span>
          </TableHead>
          <TableHead>Części</TableHead>
          <TableHead className="w-[100px]">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              {product.officialImageUrl ? (
                <img
                  src={product.officialImageUrl}
                  alt={`${product.brand} ${product.model}`}
                  className="w-10 h-10 object-cover rounded border"
                />
              ) : (
                <div className="w-10 h-10 rounded border bg-muted flex items-center justify-center">
                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </TableCell>
            <TableCell className="font-medium">{product.brand}</TableCell>
            <TableCell>{product.model}</TableCell>
            <TableCell>
              <Badge variant="outline">
                {bikeTypeLabels[product.bikeType as keyof typeof bikeTypeLabels] || product.bikeType}
              </Badge>
            </TableCell>
            <TableCell>{product.year || "-"}</TableCell>
            <TableCell>
              {product.defaultParts.length > 0 ? (
                <Badge variant="secondary">{product.defaultParts.length} części</Badge>
              ) : (
                <span className="text-muted-foreground">Brak</span>
              )}
            </TableCell>
            <TableCell>
              <div className="flex gap-1">
                <Link href={`/admin/bikes/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <DeleteButton
                  id={product.id}
                  onDelete={onDelete}
                  confirmMessage="Czy na pewno chcesz usunąć ten rower?"
                />
              </div>
            </TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={7} className="text-center text-muted-foreground">
              Brak rowerów w bazie
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
