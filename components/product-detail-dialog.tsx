"use client"

import { useState } from "react"
import { X, Star, ThumbsUp, ThumbsDown, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Lubricant, ProductRating } from "@/lib/types"

interface ProductDetailDialogProps {
  product: Lubricant | null
  ratings: ProductRating[]
  onClose: () => void
  onSelect?: (productId: string) => void
  onAddRating?: (productId: string) => void
  actionLabel?: string
}

export function ProductDetailDialog({
  product,
  ratings,
  onClose,
  onSelect,
  onAddRating,
  actionLabel = "Użyj do smarowania",
}: ProductDetailDialogProps) {
  const [filterTerrain, setFilterTerrain] = useState<string>("all")
  const [filterRating, setFilterRating] = useState<string>("all")

  if (!product) return null

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-chart-4 text-chart-4" : "fill-muted text-muted"}`}
          />
        ))}
      </div>
    )
  }

  const filteredRatings = ratings.filter((rating) => {
    if (filterRating !== "all") {
      const minRating = Number.parseInt(filterRating)
      if (rating.rating < minRating) return false
    }
    return true
  })

  return (
    <Dialog open={!!product} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <DialogTitle className="text-xl">{product.name}</DialogTitle>
                {product.sponsored && (
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    Sponsorowane
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{product.type === "oil" ? "Oliwka" : "Wosk"}</Badge>
                {product.communityRecommended && (
                  <Badge variant="outline" className="border-chart-3 text-chart-3">
                    Polecany przez społeczność
                  </Badge>
                )}
              </div>
              {product.averageRating && (
                <div className="flex items-center gap-2 mt-3">
                  {renderStars(product.averageRating)}
                  <span className="text-lg font-semibold">{product.averageRating.toFixed(1)}</span>
                  {product.totalRatings && (
                    <span className="text-sm text-muted-foreground">na podstawie {product.totalRatings} ocen</span>
                  )}
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Najważniejsze parametry */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Parametry</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Interwał</p>
                <p className="text-lg font-mono font-semibold">~{product.interval} km</p>
                {product.averageIntervalFromUsers && (
                  <p className="text-xs text-chart-3">Realne: ~{product.averageIntervalFromUsers} km</p>
                )}
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Warunki</p>
                <p className="text-sm font-semibold">
                  {product.conditions === "wet" ? "Mokre" : product.conditions === "dry" ? "Suche" : "Uniwersalny"}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Typ</p>
                <p className="text-sm font-semibold">{product.type === "oil" ? "Oliwka" : "Wosk"}</p>
              </div>
            </div>

            {product.usageByTerrain && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground">Przeznaczenie według użytkowników:</p>
                <div className="flex gap-2">
                  {product.usageByTerrain.road > 0 && (
                    <Badge variant="outline">Szosa {product.usageByTerrain.road}%</Badge>
                  )}
                  {product.usageByTerrain.gravel > 0 && (
                    <Badge variant="outline">Gravel {product.usageByTerrain.gravel}%</Badge>
                  )}
                  {product.usageByTerrain.mtb > 0 && <Badge variant="outline">MTB {product.usageByTerrain.mtb}%</Badge>}
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Akcje */}
          {(onSelect || onAddRating) && (
            <>
              <div className="flex gap-2">
                {onSelect && (
                  <Button onClick={() => onSelect(product.id)} className="flex-1">
                    {actionLabel}
                  </Button>
                )}
                {onAddRating && (
                  <Button onClick={() => onAddRating(product.id)} variant="outline">
                    Dodaj opinię
                  </Button>
                )}
              </div>
              <Separator />
            </>
          )}

          {/* Oceny i opinie */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Oceny i opinie</h3>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={filterRating} onValueChange={setFilterRating}>
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Wszystkie</SelectItem>
                    <SelectItem value="4">4+ gwiazdek</SelectItem>
                    <SelectItem value="3">3+ gwiazdek</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {filteredRatings.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm">Brak opinii spełniających kryteria</p>
                </div>
              ) : (
                filteredRatings.map((rating) => (
                  <div key={rating.id} className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">{rating.userName}</p>
                          {rating.verified && (
                            <Badge variant="outline" className="text-xs border-chart-3 text-chart-3">
                              Zweryfikowane użycie
                            </Badge>
                          )}
                        </div>
                        {renderStars(rating.rating)}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{rating.mileageWhenRated} km</p>
                    </div>

                    {rating.pros.length > 0 && (
                      <div className="mt-3 space-y-1">
                        {rating.pros.map((pro, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ThumbsUp className="h-3.5 w-3.5 text-chart-3 mt-0.5 flex-shrink-0" />
                            <span>{pro}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {rating.cons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {rating.cons.map((con, idx) => (
                          <div key={idx} className="flex items-start gap-2 text-sm">
                            <ThumbsDown className="h-3.5 w-3.5 text-chart-1 mt-0.5 flex-shrink-0" />
                            <span>{con}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground mt-3">
                      {new Date(rating.date).toLocaleDateString("pl-PL", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
