import { Card, CardContent } from "@/components/ui/card";
import { getPartName } from "@/lib/default-parts";
import { PartType } from "@/lib/generated/prisma";
import { TopProductWithReviews } from "@/app/app/actions/get-top-products";

interface TopProductsSectionProps {
  products: TopProductWithReviews[];
}

export function TopProductsSection({ products }: TopProductsSectionProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-2">
          Najpopularniejsze produkty
        </h2>
        <p className="text-muted-foreground text-center mb-8">
          Sprawdzone przez naszych rowerzystow
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.slice(0, 5).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product }: { product: TopProductWithReviews }) {
  const topReview = product.reviews[0];

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">
              {product.brand} {product.model}
            </h3>
            <p className="text-sm text-muted-foreground">
              {getPartName(product.type as PartType)}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1">
              <span className="text-yellow-500">
                {"★".repeat(Math.round(product.averageRating || 0))}
                {"☆".repeat(5 - Math.round(product.averageRating || 0))}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {product.averageRating?.toFixed(1)} ({product.totalReviews})
            </p>
          </div>
        </div>

        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
          <span>{product.totalInstallations} instalacji</span>
          {product.averageKmLifespan && product.averageKmLifespan > 0 && (
            <span>~{product.averageKmLifespan.toLocaleString("pl-PL")} km</span>
          )}
        </div>

        {topReview?.reviewText && (
          <blockquote className="border-l-2 border-primary/30 pl-3 italic text-sm text-muted-foreground line-clamp-2">
            &ldquo;{topReview.reviewText}&rdquo;
          </blockquote>
        )}
      </CardContent>
    </Card>
  );
}
