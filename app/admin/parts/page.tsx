import Link from "next/link";
import { getPartProducts } from "../_actions/part-products";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil } from "lucide-react";
import { PART_NAMES } from "@/lib/default-parts";
import { PartType } from "@/lib/generated/prisma";

export default async function PartsPage() {
  const { products } = await getPartProducts({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Czesci (PartProduct)</h1>
        <Link href="/admin/parts/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj czesc
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Typ</TableHead>
            <TableHead>Marka</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Cena</TableHead>
            <TableHead className="w-[100px]">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                <Badge variant="outline">
                  {PART_NAMES[product.type as PartType] || product.type}
                </Badge>
              </TableCell>
              <TableCell className="font-medium">{product.brand}</TableCell>
              <TableCell>{product.model}</TableCell>
              <TableCell>
                {product.officialPrice
                  ? `${product.officialPrice} PLN`
                  : "-"}
              </TableCell>
              <TableCell>
                <Link href={`/admin/parts/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                Brak czesci w bazie
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
