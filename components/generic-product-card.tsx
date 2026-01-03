"use client"

import { Star, TrendingUp, Award } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { ComponentProduct } from "@/lib/types"

interface GenericProductCardProps {
  product: ComponentProduct
  onSelect?: (productId: string) => void
  onViewDetails?: (productId: string) => void
  actionLabel?: string
  showFullDetails?: boolean
}

export function GenericProductCard({
  product,
  onSelect,
  onViewDetails,
  actionLabel = "Wybierz",
  showFullDetails = false,
}: GenericProductCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-chart-4 text-chart-4" : "fill-muted text-muted"}`}
          />
        ))}
      </div>
    )
  }

  return (
    <Card className={`${product.sponsored ? "border-muted-foreground/20" : ""}`}>
      {product.sponsored && (
        <div className="px-4 pt-3 pb-0">
          <Badge variant="outline" className="text-xs text-muted-foreground">
            Sponsorowane
          </Badge>
        </div>
      )}
      <CardHeader className={product.sponsored ? "pt-2" : ""}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <CardTitle className="text-base">{product.name}</CardTitle>
            {product.brand && (
              <p className="text-sm text-muted-foreground mt-1">
                {product.brand} {product.model}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-xs">
                {product.type}
              </Badge>
              {product.communityRecommended && (
                <Badge variant="outline" className="text-xs border-chart-3 text-chart-3">
                  <Award className="h-3 w-3 mr-1" />
                  Polecany
                </Badge>
              )}
            </div>
          </div>
        </div>
        {product.averageRating && (
          <div className="flex items-center gap-2 mt-2">
            {renderStars(product.averageRating)}
            <span className="text-sm font-semibold">{product.averageRating.toFixed(1)}</span>
            {product.totalRatings && (
              <span className="text-xs text-muted-foreground">({product.totalRatings} ocen)</span>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        {product.averageMileage && (
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5" />
              <p className="text-xs">Średni przebieg</p>
            </div>
            <p className="text-sm font-mono font-semibold">~{product.averageMileage} km</p>
            <p className="text-xs text-muted-foreground">Na podstawie danych użytkowników</p>
          </div>
        )}

        {showFullDetails && product.usageByTerrain && (
          <div className="space-y-2 pt-2 border-t border-border">
            <p className="text-xs font-semibold text-muted-foreground">Popularne w:</p>
            <div className="flex flex-wrap gap-2">
              {product.usageByTerrain.road > 0 && (
                <Badge variant="outline" className="text-xs">
                  Szosa {product.usageByTerrain.road}%
                </Badge>
              )}
              {product.usageByTerrain.gravel > 0 && (
                <Badge variant="outline" className="text-xs">
                  Gravel {product.usageByTerrain.gravel}%
                </Badge>
              )}
              {product.usageByTerrain.mtb > 0 && (
                <Badge variant="outline" className="text-xs">
                  MTB {product.usageByTerrain.mtb}%
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex gap-2">
        {onSelect && (
          <Button onClick={() => onSelect(product.id)} className="flex-1" size="sm">
            {actionLabel}
          </Button>
        )}
        {onViewDetails && (
          <Button onClick={() => onViewDetails(product.id)} variant="outline" size="sm">
            Szczegóły
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
