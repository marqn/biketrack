import Link from "next/link";
import { getBikeProducts } from "../_actions/bike-products";
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

export default async function BikesPage() {
  const { products } = await getBikeProducts({});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Rowery (BikeProduct)</h1>
        <Link href="/admin/bikes/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Dodaj rower
          </Button>
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Marka</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Typ</TableHead>
            <TableHead>Rok</TableHead>
            <TableHead>Czesci</TableHead>
            <TableHead className="w-[100px]">Akcje</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell className="font-medium">{product.brand}</TableCell>
              <TableCell>{product.model}</TableCell>
              <TableCell>
                <Badge variant="outline">{product.bikeType}</Badge>
              </TableCell>
              <TableCell>{product.year || "-"}</TableCell>
              <TableCell>
                {product.defaultParts.length > 0 ? (
                  <Badge variant="secondary">
                    {product.defaultParts.length} czesci
                  </Badge>
                ) : (
                  <span className="text-muted-foreground">Brak</span>
                )}
              </TableCell>
              <TableCell>
                <Link href={`/admin/bikes/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
          {products.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                Brak rowerow w bazie
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
