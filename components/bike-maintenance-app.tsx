"use client"

import { useState } from "react"
import { BikeHeader } from "@/components/bike-header"
import { AlertsSection } from "@/components/alerts-section"
import { ComponentsDashboard } from "@/components/components-dashboard"
import { ComponentDetailDialog } from "@/components/component-detail-dialog"
import { ProductDetailDialog } from "@/components/product-detail-dialog"
import { LoginPage } from "@/components/login-page"
import { PaywallDialog } from "@/components/paywall-dialog"
import { AdCard } from "@/components/ad-card"
import type { BikeComponent, User, Lubricant, ProductRating } from "@/lib/types"

// Mock data
const bikes = [
  { id: "1", name: "Trek Procaliber", totalMileage: 3847, syncStatus: "synced" as const },
  { id: "2", name: "Canyon Spectral", totalMileage: 2156, syncStatus: "syncing" as const },
  { id: "3", name: "Specialized Epic", totalMileage: 5234, syncStatus: "error" as const },
]

const availableLubricants: Lubricant[] = [
  {
    id: "1",
    name: "Finish Line Wet",
    type: "oil",
    interval: 150,
    conditions: "wet",
    averageRating: 4.2,
    totalRatings: 87,
    averageIntervalFromUsers: 165,
    usageByTerrain: { road: 45, gravel: 35, mtb: 20 },
  },
  {
    id: "2",
    name: "Finish Line Dry",
    type: "oil",
    interval: 200,
    conditions: "dry",
    averageRating: 4.0,
    totalRatings: 65,
    averageIntervalFromUsers: 210,
    usageByTerrain: { road: 60, gravel: 30, mtb: 10 },
  },
  {
    id: "3",
    name: "Squirt Long Lasting",
    type: "wax",
    interval: 300,
    conditions: "all",
    averageRating: 4.6,
    totalRatings: 120,
    communityRecommended: true,
    averageIntervalFromUsers: 280,
    usageByTerrain: { road: 35, gravel: 40, mtb: 25 },
  },
  {
    id: "4",
    name: "Rock N Roll Gold",
    type: "oil",
    interval: 250,
    conditions: "all",
    averageRating: 4.4,
    totalRatings: 93,
    averageIntervalFromUsers: 240,
    usageByTerrain: { road: 50, gravel: 30, mtb: 20 },
  },
  {
    id: "5",
    name: "Muc-Off Wet Lube",
    type: "oil",
    interval: 150,
    conditions: "wet",
    averageRating: 4.3,
    totalRatings: 78,
    sponsored: true,
    averageIntervalFromUsers: 170,
    usageByTerrain: { road: 40, gravel: 35, mtb: 25 },
  },
]

const productRatings: Record<string, ProductRating[]> = {
  "3": [
    {
      id: "r1",
      userId: "u1",
      userName: "Marek W.",
      rating: 5,
      pros: ["Trwałość naprawdę imponująca", "Czysty napęd przez długi czas", "Działa świetnie w gravel"],
      cons: [],
      mileageWhenRated: 850,
      componentType: "chain",
      date: "2024-12-15",
      verified: true,
    },
    {
      id: "r2",
      userId: "u2",
      userName: "Anna K.",
      rating: 5,
      pros: ["Świetne w mokrych warunkach", "Łatwo się aplikuje"],
      cons: ["Cena trochę wysoka"],
      mileageWhenRated: 620,
      componentType: "chain",
      date: "2024-12-10",
      verified: true,
    },
    {
      id: "r3",
      userId: "u3",
      userName: "Piotr M.",
      rating: 4,
      pros: ["Bardzo dobre na długich dystansach", "Mało brudu na łańcuchu"],
      cons: ["W deszczu wymaga częstszego smarowania"],
      mileageWhenRated: 1200,
      componentType: "chain",
      date: "2024-11-28",
      verified: true,
    },
    {
      id: "r4",
      userId: "u4",
      userName: "Tomasz B.",
      rating: 5,
      pros: ["Najlepszy wosk jaki próbowałem", "350 km bez problemu"],
      cons: [],
      mileageWhenRated: 920,
      componentType: "chain",
      date: "2024-11-20",
      verified: true,
    },
    {
      id: "r5",
      userId: "u5",
      userName: "Kasia L.",
      rating: 4,
      pros: ["Łańcuch cichy i płynny"],
      cons: ["Wymaga dokładnego czyszczenia przed aplikacją"],
      mileageWhenRated: 450,
      componentType: "chain",
      date: "2024-11-15",
      verified: true,
    },
  ],
  "1": [
    {
      id: "r6",
      userId: "u6",
      userName: "Michał S.",
      rating: 4,
      pros: ["Świetne w deszczu", "Przystępna cena"],
      cons: ["Szybko się brudzi", "Krótki interwał"],
      mileageWhenRated: 340,
      componentType: "chain",
      date: "2024-12-12",
      verified: true,
    },
    {
      id: "r7",
      userId: "u7",
      userName: "Ewa P.",
      rating: 4,
      pros: ["Niezawodne w każdych warunkach"],
      cons: ["Trzeba często dolewać"],
      mileageWhenRated: 280,
      componentType: "chain",
      date: "2024-12-05",
      verified: true,
    },
  ],
  "4": [
    {
      id: "r8",
      userId: "u8",
      userName: "Jacek D.",
      rating: 5,
      pros: ["Uniwersalne zastosowanie", "Samooczyszczające się"],
      cons: [],
      mileageWhenRated: 780,
      componentType: "chain",
      date: "2024-12-08",
      verified: true,
    },
    {
      id: "r9",
      userId: "u9",
      userName: "Bartek Z.",
      rating: 4,
      pros: ["Długie interwały", "Działa w każdych warunkach"],
      cons: ["Trochę droższe"],
      mileageWhenRated: 560,
      componentType: "chain",
      date: "2024-11-30",
      verified: true,
    },
  ],
}

const components: BikeComponent[] = [
  {
    id: "1",
    name: "Łańcuch Shimano XT",
    category: "drivetrain",
    currentMileage: 1847,
    maxMileage: 2000,
    status: "critical",
    lastService: "2024-09-15",
    serviceHistory: [
      { date: "2024-09-15", action: "Wymiana", mileage: 0, notes: "Nowy łańcuch Shimano XT 12-speed" },
      { date: "2024-03-20", action: "Wymiana", mileage: 0, notes: "Łańcuch po 2100 km" },
    ],
    lubricationStatus: {
      lastLubrication: {
        date: "2024-12-01",
        mileage: 1600,
        lubricant: availableLubricants[2],
      },
      lubricationHistory: [
        {
          date: "2024-12-01",
          mileage: 1600,
          lubricant: availableLubricants[2],
        },
        {
          date: "2024-11-10",
          mileage: 1300,
          lubricant: availableLubricants[2],
        },
        {
          date: "2024-10-20",
          mileage: 1000,
          lubricant: availableLubricants[2],
        },
      ],
      currentLubricant: availableLubricants[2],
    },
  },
  {
    id: "2",
    name: "Kaseta 12-speed",
    category: "drivetrain",
    currentMileage: 2847,
    maxMileage: 5000,
    status: "good",
    lastService: "2024-03-20",
    serviceHistory: [{ date: "2024-03-20", action: "Wymiana", mileage: 0, notes: "Shimano XT M8100 10-51T" }],
  },
  {
    id: "3",
    name: "Zębatka przód",
    category: "drivetrain",
    currentMileage: 1847,
    maxMileage: 4000,
    status: "good",
    lastService: "2024-09-15",
    serviceHistory: [{ date: "2024-09-15", action: "Wymiana", mileage: 0, notes: "32T Race Face Narrow Wide" }],
  },
  {
    id: "4",
    name: "Opona przód Maxxis",
    category: "wheels",
    currentMileage: 847,
    maxMileage: 1500,
    status: "good",
    lastService: "2024-11-10",
    serviceHistory: [
      { date: "2024-11-10", action: "Wymiana", mileage: 0, notes: "Maxxis Minion DHF 29x2.5" },
      { date: "2024-05-15", action: "Wymiana", mileage: 0, notes: "Maxxis Minion DHF 29x2.5" },
    ],
  },
  {
    id: "5",
    name: "Opona tył Maxxis",
    category: "wheels",
    currentMileage: 847,
    maxMileage: 1200,
    status: "good",
    lastService: "2024-11-10",
    serviceHistory: [{ date: "2024-11-10", action: "Wymiana", mileage: 0, notes: "Maxxis Minion DHR II 29x2.4" }],
  },
  {
    id: "6",
    name: "Mleko Stan's NoTubes",
    category: "wheels",
    currentMileage: 127,
    maxMileage: 180,
    status: "warning",
    lastService: "2024-10-15",
    serviceHistory: [
      { date: "2024-10-15", action: "Uzupełnienie", mileage: 127, notes: "120ml w każdym kole" },
      { date: "2024-06-20", action: "Uzupełnienie", mileage: 127, notes: "120ml w każdym kole" },
    ],
  },
  {
    id: "7",
    name: "Klocki hamulcowe przód",
    category: "brakes",
    currentMileage: 1547,
    maxMileage: 1800,
    status: "warning",
    lastService: "2024-06-10",
    serviceHistory: [{ date: "2024-06-10", action: "Wymiana", mileage: 0, notes: "Shimano J04C Metal" }],
  },
  {
    id: "8",
    name: "Klocki hamulcowe tył",
    category: "brakes",
    currentMileage: 1847,
    maxMileage: 1800,
    status: "critical",
    lastService: "2024-05-20",
    serviceHistory: [
      { date: "2024-05-20", action: "Wymiana", mileage: 0, notes: "Shimano J04C Metal" },
      { date: "2023-11-15", action: "Wymiana", mileage: 0, notes: "Shimano J04C Metal" },
    ],
  },
  {
    id: "9",
    name: "Olej do widelca",
    category: "other",
    currentMileage: 847,
    maxMileage: 1000,
    status: "warning",
    lastService: "2024-08-20",
    serviceHistory: [{ date: "2024-08-20", action: "Serwis", mileage: 847, notes: "Wymiana oleju Fox 20wt" }],
  },
  {
    id: "10",
    name: "Przerzutka tylna",
    category: "drivetrain",
    currentMileage: 2847,
    maxMileage: 8000,
    status: "good",
    lastService: "2024-03-20",
    serviceHistory: [{ date: "2024-03-20", action: "Czyszczenie", mileage: 2847, notes: "Czyszczenie i smarowanie" }],
  },
]

export function BikeMaintenanceApp() {
  const [user, setUser] = useState<User | null>({
      id: "1",
      name: "Jan Kowalski",
      email: "email@w.pl",
      plan: "free",
    })
  const [showPaywall, setShowPaywall] = useState(false)

  const [selectedBike, setSelectedBike] = useState(bikes[0])
  const [selectedComponent, setSelectedComponent] = useState<BikeComponent | null>(null)
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [bikeComponents, setBikeComponents] = useState<BikeComponent[]>(components)
  const [lubricants, setLubricants] = useState<Lubricant[]>(availableLubricants)

  const availableBikes = user?.plan === "premium" ? bikes : bikes.slice(0, 1)

  const selectedProduct = selectedProductId ? lubricants.find((l) => l.id === selectedProductId) : null
  const selectedProductRatings = selectedProductId ? productRatings[selectedProductId] || [] : []

  const handleLogin = (email: string, password: string) => {
    // Demo login - in production this would call an API
    setUser({
      id: "1",
      name: "Jan Kowalski",
      email: email,
      plan: "free",
    })
  }

  const handleLogout = () => {
    setUser(null)
    setSelectedBike(bikes[0])
  }

  const handleBikeChange = (bike: (typeof bikes)[0]) => {
    if (user?.plan === "free" && bike.id !== bikes[0].id) {
      setShowPaywall(true)
      return
    }
    setSelectedBike(bike)
  }

  const handleUpgrade = () => {
    // Demo upgrade - in production this would redirect to payment
    if (user) {
      setUser({ ...user, plan: "premium" })
      setShowPaywall(false)
    }
  }

  const handleQuickLubricate = (componentId: string) => {
    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === componentId && comp.lubricationStatus) {
          const newLubricationRecord = {
            date: new Date().toISOString(),
            mileage: comp.currentMileage,
            lubricant: comp.lubricationStatus.currentLubricant,
          }

          return {
            ...comp,
            lubricationStatus: {
              ...comp.lubricationStatus,
              lastLubrication: newLubricationRecord,
              lubricationHistory: [newLubricationRecord, ...comp.lubricationStatus.lubricationHistory],
            },
          }
        }
        return comp
      }),
    )
  }

  const handleLubricate = (lubricantId: string) => {
    if (!selectedComponent) return

    const selectedLubricant = lubricants.find((l) => l.id === lubricantId)
    if (!selectedLubricant) return

    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === selectedComponent.id && comp.lubricationStatus) {
          const newLubricationRecord = {
            date: new Date().toISOString(),
            mileage: comp.currentMileage,
            lubricant: selectedLubricant,
          }

          const updatedComponent = {
            ...comp,
            lubricationStatus: {
              ...comp.lubricationStatus,
              lastLubrication: newLubricationRecord,
              currentLubricant: selectedLubricant,
              lubricationHistory: [newLubricationRecord, ...comp.lubricationStatus.lubricationHistory],
            },
          }

          setSelectedComponent(updatedComponent)
          return updatedComponent
        }
        return comp
      }),
    )
  }

  const handleDeleteLubrication = (index: number) => {
    if (!selectedComponent) return

    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === selectedComponent.id && comp.lubricationStatus) {
          const newHistory = [...comp.lubricationStatus.lubricationHistory]
          newHistory.splice(index, 1)

          const updatedComponent = {
            ...comp,
            lubricationStatus: {
              ...comp.lubricationStatus,
              lastLubrication: newHistory[0] || null,
              lubricationHistory: newHistory,
            },
          }

          setSelectedComponent(updatedComponent)
          return updatedComponent
        }
        return comp
      }),
    )
  }

  const handleAddLubricant = (newLubricant: Omit<Lubricant, "id">) => {
    const lubricant: Lubricant = {
      ...newLubricant,
      id: Date.now().toString(),
    }
    setLubricants((prev) => [...prev, lubricant])
  }

  const handleViewProductDetails = (productId: string) => {
    setSelectedProductId(productId)
  }

  const handleSelectProductFromDetail = (productId: string) => {
    setSelectedProductId(null)
    if (selectedComponent && selectedComponent.lubricationStatus) {
      handleLubricate(productId)
    }
  }

  const handleAddRating = (productId: string) => {
    // In production, this would open a rating form
    console.log("Add rating for product:", productId)
  }

  const handleReset = (componentId: string) => {
    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === componentId) {
          const newServiceRecord = {
            date: new Date().toISOString(),
            action: "Wymiana",
            mileage: 0,
            notes: `Reset po ${comp.currentMileage} km`,
          }

          const updatedComponent = {
            ...comp,
            currentMileage: 0,
            status: "good" as const,
            serviceHistory: [newServiceRecord, ...comp.serviceHistory],
          }

          // Update selectedComponent if it's the same one
          if (selectedComponent?.id === componentId) {
            setSelectedComponent(updatedComponent)
          }

          return updatedComponent
        }
        return comp
      }),
    )
  }

  const handleAddService = (componentId: string, service: { action: string; notes?: string }) => {
    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === componentId) {
          const newServiceRecord = {
            date: new Date().toISOString(),
            action: service.action,
            mileage: comp.currentMileage,
            notes: service.notes,
          }

          const updatedComponent = {
            ...comp,
            serviceHistory: [newServiceRecord, ...comp.serviceHistory],
            lastService: newServiceRecord.date,
          }

          // Update selectedComponent if it's the same one
          if (selectedComponent?.id === componentId) {
            setSelectedComponent(updatedComponent)
          }

          return updatedComponent
        }
        return comp
      }),
    )
  }

  const handleEditService = (
    componentId: string,
    serviceIndex: number,
    service: { action: string; notes?: string; mileage: number },
  ) => {
    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === componentId) {
          const newHistory = [...comp.serviceHistory]
          newHistory[serviceIndex] = {
            ...newHistory[serviceIndex],
            action: service.action,
            notes: service.notes,
            mileage: service.mileage,
          }

          const updatedComponent = {
            ...comp,
            serviceHistory: newHistory,
          }

          // Update selectedComponent if it's the same one
          if (selectedComponent?.id === componentId) {
            setSelectedComponent(updatedComponent)
          }

          return updatedComponent
        }
        return comp
      }),
    )
  }

  const handleDeleteService = (componentId: string, serviceIndex: number) => {
    setBikeComponents((prevComponents) =>
      prevComponents.map((comp) => {
        if (comp.id === componentId) {
          const newHistory = [...comp.serviceHistory]
          newHistory.splice(serviceIndex, 1)

          const updatedComponent = {
            ...comp,
            serviceHistory: newHistory,
          }

          // Update selectedComponent if it's the same one
          if (selectedComponent?.id === componentId) {
            setSelectedComponent(updatedComponent)
          }

          return updatedComponent
        }
        return comp
      }),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <BikeHeader
        bike={selectedBike}
        bikes={availableBikes}
        onBikeChange={handleBikeChange}
        user={user}
        onLogout={handleLogout}
        onUpgrade={() => setShowPaywall(true)}
      />

      <main className="container mx-auto px-4 pt-24 pb-8 space-y-6">
        <AlertsSection components={bikeComponents} />

        {user.plan === "free" && <AdCard onUpgrade={() => setShowPaywall(true)} />}

        <ComponentsDashboard
          components={bikeComponents}
          onComponentClick={setSelectedComponent}
          onQuickLubricate={handleQuickLubricate}
        />
      </main>

      <ComponentDetailDialog
        component={selectedComponent}
        onClose={() => setSelectedComponent(null)}
        onLubricate={handleLubricate}
        onDeleteLubrication={handleDeleteLubrication}
        availableLubricants={lubricants}
        onAddLubricant={handleAddLubricant}
        onViewProductDetails={handleViewProductDetails}
        onReset={handleReset}
        onAddService={handleAddService}
        onEditService={handleEditService}
        onDeleteService={handleDeleteService}
      />

      <ProductDetailDialog
        product={selectedProduct}
        ratings={selectedProductRatings}
        onClose={() => setSelectedProductId(null)}
        onSelect={handleSelectProductFromDetail}
        onAddRating={handleAddRating}
        actionLabel="Użyj do smarowania"
      />

      <PaywallDialog open={showPaywall} onClose={() => setShowPaywall(false)} onUpgrade={handleUpgrade} />
    </div>
  )
}
