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
import { PART_NAMES } from "@/lib/default-parts";
import { PartType } from "@/lib/generated/prisma";
import { DeleteButton } from "../_components/DeleteButton";
import { ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";

type SortKey = "type" | "brand" | "model" | "createdAt";
type SortDir = "asc" | "desc";

interface Product {
  id: string;
  type: string;
  brand: string;
  model: string;
  createdAt: Date | string | null;
}

interface PartsTableProps {
  products: Product[];
  onDelete: (id: string) => Promise<void>;
}

export function PartsTable({ products, onDelete }: PartsTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>("type");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir(key === "createdAt" ? "desc" : "asc");
    }
  }

  const sorted = useMemo(() => {
    return [...products].sort((a, b) => {
      let cmp = 0;
      if (sortKey === "type") {
        const nameA = PART_NAMES[a.type as PartType] || a.type;
        const nameB = PART_NAMES[b.type as PartType] || b.type;
        cmp = nameA.localeCompare(nameB, "pl");
      } else if (sortKey === "brand" || sortKey === "model") {
        cmp = (a[sortKey] || "").localeCompare(b[sortKey] || "", "pl");
      } else if (sortKey === "createdAt") {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        cmp = da - db;
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
          <TableHead className={headerClass} onClick={() => handleSort("type")}>
            <span className="inline-flex items-center">Typ <SortIcon column="type" /></span>
          </TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("brand")}>
            <span className="inline-flex items-center">Marka <SortIcon column="brand" /></span>
          </TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("model")}>
            <span className="inline-flex items-center">Model <SortIcon column="model" /></span>
          </TableHead>
          <TableHead className={headerClass} onClick={() => handleSort("createdAt")}>
            <span className="inline-flex items-center">Dodano <SortIcon column="createdAt" /></span>
          </TableHead>
          <TableHead className="w-20">Akcje</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sorted.map((product) => (
          <TableRow key={product.id} className="group">
            <TableCell>
              <Link href={`/admin/parts/${product.id}`} className="block">
                <Badge variant="outline">
                  {PART_NAMES[product.type as PartType] || product.type}
                </Badge>
              </Link>
            </TableCell>
            <TableCell className="font-medium">
              <Link href={`/admin/parts/${product.id}`} className="block">
                {product.brand}
              </Link>
            </TableCell>
            <TableCell>
              <Link href={`/admin/parts/${product.id}`} className="block">
                {product.model}
              </Link>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {product.createdAt
                ? new Date(product.createdAt).toLocaleDateString("pl-PL")
                : "—"}
            </TableCell>
            <TableCell>
              <DeleteButton id={product.id} onDelete={onDelete} />
            </TableCell>
          </TableRow>
        ))}
        {sorted.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              Brak części w bazie
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
