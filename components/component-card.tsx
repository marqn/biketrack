"use client"

import type React from "react"

import { ChevronRight, Droplet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import type { BikeComponent } from "@/lib/types"

interface ComponentCardProps {
  component: BikeComponent
  onClick: () => void
  onQuickLubricate?: (e: React.MouseEvent) => void
}

export function ComponentCard({ component, onClick, onQuickLubricate }: ComponentCardProps) {
  const wearPercentage = (component.currentMileage / component.maxMileage) * 100

  const lubricationStatus = component.lubricationStatus
  const kmSinceLastLube = lubricationStatus?.lastLubrication
    ? component.currentMileage - lubricationStatus.lastLubrication.mileage
    : null
  const lubricationPercentage =
    lubricationStatus && kmSinceLastLube !== null
      ? (kmSinceLastLube / lubricationStatus.currentLubricant.interval) * 100
      : null
  const isLubricationOverdue =
    lubricationStatus && kmSinceLastLube !== null && kmSinceLastLube > lubricationStatus.currentLubricant.interval

  const getStatusBadge = () => {
    switch (component.status) {
      case "critical":
        return (
          <Badge variant="destructive" className="text-xs">
            Krytyczny
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="outline" className="text-xs border-chart-4 text-chart-4">
            Uwaga
          </Badge>
        )
      case "good":
        return (
          <Badge variant="outline" className="text-xs border-chart-3 text-chart-3">
            Dobry
          </Badge>
        )
    }
  }

  const getProgressColor = () => {
    if (wearPercentage >= 90) return "bg-destructive"
    if (wearPercentage >= 75) return "bg-chart-4"
    return "bg-chart-3"
  }

  const getLubricationProgressColor = () => {
    if (!lubricationPercentage) return "bg-chart-2"
    if (isLubricationOverdue || lubricationPercentage >= 100) return "bg-destructive"
    if (lubricationPercentage >= 90) return "bg-chart-4"
    return "bg-chart-2"
  }

  return (
    <Button variant="ghost" className="h-auto w-full justify-between p-3 hover:bg-accent" onClick={onClick}>
      <div className="flex-1 text-left">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm text-foreground">{component.name}</h3>
          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {isLubricationOverdue && (
              <Badge variant="destructive" className="text-xs">
                Smar!
              </Badge>
            )}
            {onQuickLubricate && (
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7 shrink-0 bg-transparent"
                onClick={(e) => {
                  e.stopPropagation()
                  onQuickLubricate(e)
                }}
              >
                <Droplet className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Przebieg</span>
            <span className="font-mono">
              {component.currentMileage} / {component.maxMileage} km
            </span>
          </div>
          <Progress value={wearPercentage} className="h-1.5">
            <div className={`h-full ${getProgressColor()}`} style={{ width: `${wearPercentage}%` }} />
          </Progress>

          {lubricationStatus && kmSinceLastLube !== null && (
            <>
              <div className="flex justify-between text-xs text-muted-foreground pt-1">
                <span>Smar</span>
                <span className="font-mono">
                  {kmSinceLastLube} / {lubricationStatus.currentLubricant.interval} km
                </span>
              </div>
              <Progress value={Math.min(lubricationPercentage || 0, 100)} className="h-1.5">
                <div
                  className={`h-full ${getLubricationProgressColor()}`}
                  style={{ width: `${Math.min(lubricationPercentage || 0, 100)}%` }}
                />
              </Progress>
              <p className="text-xs text-muted-foreground">
                {isLubricationOverdue ? (
                  <span className="text-destructive font-medium">
                    Przekroczono o {kmSinceLastLube - lubricationStatus.currentLubricant.interval} km!
                  </span>
                ) : kmSinceLastLube === 0 ? (
                  `Smarowane: teraz • następne za ${lubricationStatus.currentLubricant.interval} km`
                ) : (
                  `Smarowane: ${kmSinceLastLube} km temu`
                )}
              </p>
            </>
          )}
        </div>
      </div>

      <ChevronRight className="h-4 w-4 ml-2 text-muted-foreground flex-shrink-0" />
    </Button>
  )
}
