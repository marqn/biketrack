"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { updateEmail } from "../actions/update-email"
import { useTransition } from "react"

interface AddEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEmailDialog({ open, onOpenChange }: AddEmailDialogProps) {
  const [pending, startTransition] = useTransition()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj adres e-mail</DialogTitle>
        </DialogHeader>

        <form
          action={(formData) =>
            startTransition(async () => {
              await updateEmail(formData)
              onOpenChange(false)
            })
          }
          className="space-y-4"
        >
          <Input
            name="email"
            type="email"
            placeholder="email@example.com"
            required
          />

          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}