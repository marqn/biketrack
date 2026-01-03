"use client"

import { AlertTriangle, AlertCircle, Droplet } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { BikeComponent } from "@/lib/types"

interface AlertsSectionProps {
  components: BikeComponent[]
}

export function AlertsSection({ components }: AlertsSectionProps) {
  const criticalComponents = components.filter((c) => c.status === "critical")
  const warningComponents = components.filter((c) => c.status === "warning")

  const overdueLubrication = components.filter((c) => {
    if (!c.lubricationStatus?.lastLubrication) return false
    const kmSinceLastLube = c.currentMileage - c.lubricationStatus.lastLubrication.mileage
    return kmSinceLastLube > c.lubricationStatus.currentLubricant.interval
  })
  // </CHANGE>

  if (criticalComponents.length === 0 && warningComponents.length === 0 && overdueLubrication.length === 0) {
    return null
  }
  // </CHANGE>

  return (
    <div className="mb-6 space-y-3">
      {criticalComponents.length > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Krytyczne serwisy:</span>{" "}
            {criticalComponents.map((c, i) => (
              <span key={c.id}>
                {c.name}
                {i < criticalComponents.length - 1 ? ", " : ""}
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}

      {overdueLubrication.length > 0 && (
        <Alert variant="destructive" className="border-destructive/50 bg-destructive/10">
          <Droplet className="h-4 w-4" />
          <AlertDescription>
            <span className="font-semibold">Wymagane smarowanie:</span>{" "}
            {overdueLubrication.map((c, i) => {
              const kmSinceLastLube = c.lubricationStatus?.lastLubrication
                ? c.currentMileage - c.lubricationStatus.lastLubrication.mileage
                : 0
              const overdue = c.lubricationStatus ? kmSinceLastLube - c.lubricationStatus.currentLubricant.interval : 0
              return (
                <span key={c.id}>
                  {c.name} (+{overdue} km)
                  {i < overdueLubrication.length - 1 ? ", " : ""}
                </span>
              )
            })}
          </AlertDescription>
        </Alert>
      )}
      {/* </CHANGE> */}

      {warningComponents.length > 0 && (
        <Alert className="border-chart-4/50 bg-chart-4/10">
          <AlertCircle className="h-4 w-4 text-chart-4" />
          <AlertDescription>
            <span className="font-semibold">Zbliżające się serwisy:</span>{" "}
            {warningComponents.map((c, i) => (
              <span key={c.id}>
                {c.name}
                {i < warningComponents.length - 1 ? ", " : ""}
              </span>
            ))}
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
