"use client"

import { Star, Droplet, Gauge, CloudRain, Sun } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import type { Lubricant } from "@/lib/types"

interface ProductCardProps {
  product: Lubricant
  onSelect?: (productId: string) => void
  onViewDetails?: (productId: string) => void
  actionLabel?: string
  showFullDetails?: boolean
}

export function ProductCard({
  product,
  onSelect,
  onViewDetails,
  actionLabel = "Użyj",
  showFullDetails = false,
}: ProductCardProps) {
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

  const getConditionIcon = () => {
    switch (product.conditions) {
      case "wet":
        return <CloudRain className="h-3.5 w-3.5" />
      case "dry":
        return <Sun className="h-3.5 w-3.5" />
      default:
        return <Gauge className="h-3.5 w-3.5" />
    }
  }

  const getConditionLabel = () => {
    switch (product.conditions) {
      case "wet":
        return "Mokre warunki"
      case "dry":
        return "Suche warunki"
      default:
        return "Uniwersalny"
    }
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
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">
                {product.type === "oil" ? "Oliwka" : "Wosk"}
              </Badge>
              {product.communityRecommended && (
                <Badge variant="outline" className="text-xs border-chart-3 text-chart-3">
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
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Droplet className="h-3.5 w-3.5" />
              <p className="text-xs">Interwał</p>
            </div>
            <p className="text-sm font-mono font-semibold">~{product.interval} km</p>
            {product.averageIntervalFromUsers && (
              <p className="text-xs text-muted-foreground">Użytkownicy: ~{product.averageIntervalFromUsers} km</p>
            )}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              {getConditionIcon()}
              <p className="text-xs">Warunki</p>
            </div>
            <p className="text-sm font-semibold">{getConditionLabel()}</p>
          </div>
        </div>

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
