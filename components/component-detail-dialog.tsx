"use client"

import { useState } from "react"
import { X, RotateCcw, Calendar, Droplet, Trash2, Info, Edit2, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AddLubricantDialog } from "@/components/add-lubricant-dialog"
import { ProductCard } from "@/components/product-card"
import type { BikeComponent, Lubricant } from "@/lib/types"

interface ComponentDetailDialogProps {
  component: BikeComponent | null
  onClose: () => void
  onLubricate?: (lubricantId: string) => void
  onDeleteLubrication?: (index: number) => void
  availableLubricants?: Lubricant[]
  onAddLubricant?: (lubricant: Omit<Lubricant, "id">) => void
  onViewProductDetails?: (productId: string) => void
  onReset?: (componentId: string) => void
  onAddService?: (componentId: string, service: { action: string; notes?: string }) => void
  onEditService?: (
    componentId: string,
    serviceIndex: number,
    service: { action: string; notes?: string; mileage: number },
  ) => void
  onDeleteService?: (componentId: string, serviceIndex: number) => void
}

export function ComponentDetailDialog({
  component,
  onClose,
  onLubricate,
  onDeleteLubrication,
  availableLubricants = [],
  onAddLubricant,
  onViewProductDetails,
  onReset,
  onAddService,
  onEditService,
  onDeleteService,
}: ComponentDetailDialogProps) {
  const [selectedLubricantId, setSelectedLubricantId] = useState<string>("")
  const [showLubricateForm, setShowLubricateForm] = useState(false)
  const [showServiceForm, setShowServiceForm] = useState(false)
  const [serviceAction, setServiceAction] = useState("")
  const [serviceNotes, setServiceNotes] = useState("")
  const [editingServiceIndex, setEditingServiceIndex] = useState<number | null>(null)
  const [editServiceAction, setEditServiceAction] = useState("")
  const [editServiceNotes, setEditServiceNotes] = useState("")
  const [editServiceMileage, setEditServiceMileage] = useState("")
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showSaveServiceConfirm, setShowSaveServiceConfirm] = useState(false)
  const [showSaveEditConfirm, setShowSaveEditConfirm] = useState(false)
  const [pendingService, setPendingService] = useState<{ action: string; notes?: string } | null>(null)

  if (!component) return null

  const wearPercentage = (component.currentMileage / component.maxMileage) * 100

  const getStatusBadge = () => {
    switch (component.status) {
      case "critical":
        return <Badge variant="destructive">Krytyczny</Badge>
      case "warning":
        return (
          <Badge variant="outline" className="border-chart-4 text-chart-4">
            Uwaga
          </Badge>
        )
      case "good":
        return (
          <Badge variant="outline" className="border-chart-3 text-chart-3">
            Dobry
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pl-PL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleLubricate = () => {
    if (selectedLubricantId && onLubricate) {
      onLubricate(selectedLubricantId)
      setShowLubricateForm(false)
    }
  }

  const handleResetClick = () => {
    setShowResetConfirm(true)
  }

  const handleResetConfirm = () => {
    if (onReset && component) {
      onReset(component.id)
      setShowResetConfirm(false)
    }
  }

  const handleAddServiceClick = () => {
    if (serviceAction.trim() && onAddService && component) {
      setPendingService({
        action: serviceAction,
        notes: serviceNotes.trim() || undefined,
      })
      setShowSaveServiceConfirm(true)
    }
  }

  const handleSaveServiceConfirm = () => {
    if (pendingService && onAddService && component) {
      onAddService(component.id, pendingService)
      setServiceAction("")
      setServiceNotes("")
      setShowServiceForm(false)
      setShowSaveServiceConfirm(false)
      setPendingService(null)
    }
  }

  const handleEditServiceClick = (index: number, service: any) => {
    setEditingServiceIndex(index)
    setEditServiceAction(service.action)
    setEditServiceNotes(service.notes || "")
    setEditServiceMileage(service.mileage.toString())
  }

  const handleSaveEditClick = () => {
    setShowSaveEditConfirm(true)
  }

  const handleSaveEditConfirm = () => {
    if (editingServiceIndex !== null && onEditService && component) {
      onEditService(component.id, editingServiceIndex, {
        action: editServiceAction,
        notes: editServiceNotes.trim() || undefined,
        mileage: Number.parseInt(editServiceMileage) || 0,
      })
      setEditingServiceIndex(null)
      setEditServiceAction("")
      setEditServiceNotes("")
      setEditServiceMileage("")
      setShowSaveEditConfirm(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingServiceIndex(null)
    setEditServiceAction("")
    setEditServiceNotes("")
    setEditServiceMileage("")
  }

  return (
    <>
      <Dialog open={!!component} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-xl mb-2">{component.name}</DialogTitle>
                <div className="flex items-center gap-2">{getStatusBadge()}</div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Parametry */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Parametry</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Aktualny przebieg</p>
                  <p className="text-lg font-mono font-semibold">{component.currentMileage} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Maksymalny przebieg</p>
                  <p className="text-lg font-mono font-semibold">{component.maxMileage} km</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Zużycie</p>
                  <p className="text-lg font-mono font-semibold">{wearPercentage.toFixed(1)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Pozostało</p>
                  <p className="text-lg font-mono font-semibold">
                    {component.maxMileage - component.currentMileage} km
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Akcje */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Akcje</h3>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={handleResetClick}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset po wymianie
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowServiceForm(!showServiceForm)}>
                  <Calendar className="h-4 w-4 mr-2" />
                  Dodaj serwis
                </Button>
                {component.lubricationStatus && onLubricate && (
                  <Button variant="outline" size="sm" onClick={() => setShowLubricateForm(!showLubricateForm)}>
                    <Droplet className="h-4 w-4 mr-2" />
                    Smaruj łańcuch
                  </Button>
                )}
              </div>

              {showServiceForm && (
                <div className="mt-4 space-y-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="space-y-2">
                    <Label htmlFor="service-action">Akcja serwisowa</Label>
                    <Input
                      id="service-action"
                      placeholder="np. Czyszczenie, Regulacja, Wymiana oleju"
                      value={serviceAction}
                      onChange={(e) => setServiceAction(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service-notes">Notatki (opcjonalnie)</Label>
                    <Textarea
                      id="service-notes"
                      placeholder="Dodatkowe informacje..."
                      value={serviceNotes}
                      onChange={(e) => setServiceNotes(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleAddServiceClick} disabled={!serviceAction.trim()} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Zapisz serwis
                    </Button>
                    <Button variant="outline" onClick={() => setShowServiceForm(false)} size="sm">
                      Anuluj
                    </Button>
                  </div>
                </div>
              )}

              {showLubricateForm && component.lubricationStatus && (
                <div className="mt-4 space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Info className="h-4 w-4" />
                    <p>Wybierz produkt smarujący lub dodaj nowy</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableLubricants.map((lubricant) => (
                      <ProductCard
                        key={lubricant.id}
                        product={lubricant}
                        onSelect={(id) => {
                          setSelectedLubricantId(id)
                          if (onLubricate) {
                            onLubricate(id)
                            setShowLubricateForm(false)
                          }
                        }}
                        onViewDetails={onViewProductDetails}
                        actionLabel="Użyj"
                      />
                    ))}
                  </div>

                  {onAddLubricant && (
                    <div className="pt-2 border-t border-border">
                      <AddLubricantDialog onAdd={onAddLubricant} />
                    </div>
                  )}

                  <Button variant="outline" onClick={() => setShowLubricateForm(false)} size="sm" className="w-full">
                    Anuluj
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {component.lubricationStatus && component.lubricationStatus.lubricationHistory.length > 0 && (
              <>
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-foreground">Historia smarowań</h3>
                  <div className="space-y-2">
                    {component.lubricationStatus.lubricationHistory.map((lubrication, index) => (
                      <div key={index} className="rounded-lg border border-border bg-muted/30 p-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Droplet className="h-3.5 w-3.5 text-chart-2" />
                              <p className="font-medium text-sm">{lubrication.lubricant.name}</p>
                              <Badge variant="outline" className="text-xs">
                                {lubrication.lubricant.type === "oil" ? "Oliwka" : "Wosk"}
                              </Badge>
                              {lubrication.lubricant.conditions && lubrication.lubricant.conditions !== "all" && (
                                <Badge variant="outline" className="text-xs text-muted-foreground">
                                  {lubrication.lubricant.conditions === "wet" ? "mokre" : "suche"}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground">{formatDate(lubrication.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {lubrication.mileage} km
                            </Badge>
                            {onDeleteLubrication && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onDeleteLubrication(index)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Historia serwisów */}
            <div>
              <h3 className="text-sm font-semibold mb-3 text-foreground">Historia serwisów</h3>
              <div className="space-y-3">
                {component.serviceHistory.map((service, index) => (
                  <div key={index} className="rounded-lg border border-border bg-muted/30 p-3">
                    {editingServiceIndex === index ? (
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor={`edit-action-${index}`}>Akcja</Label>
                          <Input
                            id={`edit-action-${index}`}
                            value={editServiceAction}
                            onChange={(e) => setEditServiceAction(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-mileage-${index}`}>Przebieg (km)</Label>
                          <Input
                            id={`edit-mileage-${index}`}
                            type="number"
                            value={editServiceMileage}
                            onChange={(e) => setEditServiceMileage(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`edit-notes-${index}`}>Notatki</Label>
                          <Textarea
                            id={`edit-notes-${index}`}
                            value={editServiceNotes}
                            onChange={(e) => setEditServiceNotes(e.target.value)}
                            rows={2}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={handleSaveEditClick}>
                            <Save className="h-3.5 w-3.5 mr-2" />
                            Zapisz
                          </Button>
                          <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                            Anuluj
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium text-sm">{service.action}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(service.date)}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs font-mono">
                              {service.mileage} km
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleEditServiceClick(index, service)}
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </Button>
                            {onDeleteService && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => onDeleteService(component.id, index)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                        </div>
                        {service.notes && <p className="text-sm text-muted-foreground">{service.notes}</p>}
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showResetConfirm} onOpenChange={setShowResetConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno zresetować komponent?</AlertDialogTitle>
            <AlertDialogDescription>
              To zresetuje licznik przebiegu do 0 km i doda wpis o wymianie w historii serwisów. Tej operacji nie można
              cofnąć.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm}>Tak, zresetuj</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSaveServiceConfirm} onOpenChange={setShowSaveServiceConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno zapisać serwis?</AlertDialogTitle>
            <AlertDialogDescription>
              Serwis zostanie dodany z aktualnym przebiegiem roweru: {component?.currentMileage} km
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingService(null)}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveServiceConfirm}>Tak, zapisz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showSaveEditConfirm} onOpenChange={setShowSaveEditConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Czy na pewno zapisać zmiany?</AlertDialogTitle>
            <AlertDialogDescription>Edytowany wpis serwisowy zostanie zaktualizowany.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={handleSaveEditConfirm}>Tak, zapisz</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
