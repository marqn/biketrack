"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"

interface AdCardProps {
  onUpgrade: () => void
}

export function AdCard({ onUpgrade }: AdCardProps) {
  return (
    <Card className="border-dashed bg-muted/30">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Odblokuj pełen potencjał BikeTrack</h3>
              <p className="text-sm text-muted-foreground">
                Usuń reklamy, dodaj wiele rowerów i korzystaj z zaawansowanych funkcji już od 39 zł/miesiąc.
              </p>
            </div>
          </div>
          <Button onClick={onUpgrade} variant="default" className="flex-shrink-0">
            Sprawdź Premium
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
