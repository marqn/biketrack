"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { updateEmail } from "../actions/update-email"
import { useState, useTransition } from "react"

interface AddEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEmailDialog({ open, onOpenChange }: AddEmailDialogProps) {
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (formData: FormData) => {
    setError(null)
    
    startTransition(async () => {
      const result = await updateEmail(formData)
      
      if (result.success) {
        onOpenChange(false)
        window.location.reload() // Odśwież stronę, aby zaktualizować sesję
      } else {
        setError(result.error || "Wystąpił błąd")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj adres e-mail</DialogTitle>
          <DialogDescription>
            Konto Strava nie zawiera adresu email. Dodaj swój email, aby otrzymywać powiadomienia.
          </DialogDescription>
        </DialogHeader>

        <form action={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Adres email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="twoj@email.pl"
              required
              disabled={pending}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
              className="flex-1"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={pending} className="flex-1">
              {pending ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}