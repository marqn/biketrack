"use client"

import { Cog, Disc, Disc3, Wrench } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ComponentCard } from "@/components/component-card"
import type { BikeComponent } from "@/lib/types"

interface ComponentsDashboardProps {
  components: BikeComponent[]
  onComponentClick: (component: BikeComponent) => void
  onQuickLubricate?: (componentId: string) => void // Added quick lubricate handler
}

const categories = [
  { id: "drivetrain", name: "Napęd", icon: Cog },
  { id: "wheels", name: "Koła", icon: Disc3 },
  { id: "brakes", name: "Hamulce", icon: Disc },
  { id: "other", name: "Inne", icon: Wrench },
] as const

export function ComponentsDashboard({ components, onComponentClick, onQuickLubricate }: ComponentsDashboardProps) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {categories.map((category) => {
        const categoryComponents = components.filter((c) => c.category === category.id)
        const Icon = category.icon

        return (
          <Card key={category.id} className="bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Icon className="h-5 w-5 text-muted-foreground" />
                {category.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categoryComponents.map((component) => (
                <ComponentCard
                  key={component.id}
                  component={component}
                  onClick={() => onComponentClick(component)}
                  onQuickLubricate={component.lubricationStatus ? () => onQuickLubricate?.(component.id) : undefined}
                />
              ))}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
