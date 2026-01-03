"use client"

import type React from "react"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Lubricant } from "@/lib/types"

interface AddLubricantDialogProps {
  onAdd: (lubricant: Omit<Lubricant, "id">) => void
}

export function AddLubricantDialog({ onAdd }: AddLubricantDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"oil" | "wax">("oil")
  const [interval, setInterval] = useState(150)
  const [conditions, setConditions] = useState<"dry" | "wet" | "all">("all")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onAdd({
      name: name.trim(),
      type,
      interval,
      conditions,
    })

    // Reset form
    setName("")
    setType("oil")
    setInterval(150)
    setConditions("all")
    setOpen(false)
  }

  const handleTypeChange = (newType: "oil" | "wax") => {
    setType(newType)
    // Auto-set recommended intervals
    if (newType === "oil") {
      setInterval(150)
    } else {
      setInterval(300)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Dodaj nowy produkt
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Dodaj produkt smarujący</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nazwa produktu</Label>
            <Input
              id="name"
              placeholder="np. Finish Line Wet"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Typ</Label>
            <Select value={type} onValueChange={handleTypeChange}>
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="oil">Oliwka</SelectItem>
                <SelectItem value="wax">Wosk</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {type === "oil" ? "Polecany interwał: 150-250 km" : "Polecany interwał: 300-500 km"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Interwał smarowania (km)</Label>
            <Input
              id="interval"
              type="number"
              min="50"
              max="1000"
              step="50"
              value={interval}
              onChange={(e) => setInterval(Number.parseInt(e.target.value))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="conditions">Warunki</Label>
            <Select value={conditions} onValueChange={(v) => setConditions(v as "dry" | "wet" | "all")}>
              <SelectTrigger id="conditions">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Uniwersalny</SelectItem>
                <SelectItem value="dry">Suche warunki</SelectItem>
                <SelectItem value="wet">Mokre warunki</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Dodaj produkt
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Anuluj
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
