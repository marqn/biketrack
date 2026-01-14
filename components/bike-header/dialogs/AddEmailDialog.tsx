"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AddEmailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddEmailDialog({ open, onOpenChange }: AddEmailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dodaj adres e-mail</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input type="email" placeholder="email@example.com" />
          <Button className="w-full">Zapisz</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
