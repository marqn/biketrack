"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Check, Sparkles } from "lucide-react"

interface PaywallDialogProps {
  open: boolean
  onClose: () => void
  onUpgrade: () => void
}

export function PaywallDialog({ open, onClose, onUpgrade }: PaywallDialogProps) {
  const features = [
    "Nieograniczona liczba rowerów",
    "Brak reklam",
    "Pełna historia serwisowa bez limitu",
    "Eksport do PDF",
    "Priorytetowe integracje (Strava, Garmin)",
    "Powiadomienia o zbliżających się serwisach",
  ]

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl">Przejdź na Premium</DialogTitle>
          </div>
          <DialogDescription>
            Wersja darmowa pozwala na śledzenie tylko jednego roweru. Odblokuj pełen potencjał BikeTrack z planem
            Premium.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="mt-0.5">
                  <Check className="h-4 w-4 text-chart-3" />
                </div>
                <p className="text-sm text-foreground">{feature}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-border">
            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-bold">39 zł</span>
              <span className="text-muted-foreground">/miesiąc</span>
            </div>
            <Button onClick={onUpgrade} className="w-full" size="lg">
              Rozpocznij 14-dniowy trial
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Bez zobowiązań. Anuluj w dowolnym momencie.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
