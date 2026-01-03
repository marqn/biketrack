"use client"

import { Check, ChevronDown, Wifi, WifiOff, Loader2, UserIcon, LogOut, CreditCard } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import type { User } from "@/lib/types"

interface Bike {
  id: string
  name: string
  totalMileage: number
  syncStatus: "synced" | "syncing" | "error"
}

interface BikeHeaderProps {
  bike: Bike
  bikes: Bike[]
  onBikeChange: (bike: Bike) => void
  user: User
  onLogout: () => void
  onUpgrade: () => void
}

export function BikeHeader({ bike, bikes, onBikeChange, user, onLogout, onUpgrade }: BikeHeaderProps) {
  const getSyncIcon = () => {
    switch (bike.syncStatus) {
      case "synced":
        return <Wifi className="h-4 w-4 text-chart-3" />
      case "syncing":
        return <Loader2 className="h-4 w-4 text-chart-4 animate-spin" />
      case "error":
        return <WifiOff className="h-4 w-4 text-destructive" />
    }
  }

  const getSyncText = () => {
    switch (bike.syncStatus) {
      case "synced":
        return "Zsynchronizowany"
      case "syncing":
        return "Synchronizacja..."
      case "error":
        return "Błąd synchronizacji"
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                <div className="flex items-center gap-2 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg font-semibold text-foreground">{bike.name}</h1>
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Całkowity przebieg:{" "}
                      <span className="font-mono text-foreground">{bike.totalMileage.toLocaleString("pl-PL")} km</span>
                    </p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              {bikes.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => onBikeChange(b)}
                  className="flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">{b.totalMileage.toLocaleString("pl-PL")} km</div>
                  </div>
                  {b.id === bike.id && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {getSyncIcon()}
              <span className="hidden sm:inline text-muted-foreground">{getSyncText()}</span>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-xs">{getInitials(user.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col gap-0.5">
                    <p className="text-sm font-medium">{user.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                      <Badge
                        variant={user.plan === "premium" ? "default" : "secondary"}
                        className="text-[10px] px-1 py-0"
                      >
                        {user.plan === "premium" ? "Premium" : "Free"}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {}}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </DropdownMenuItem>
                {user.plan === "free" && (
                  <DropdownMenuItem onClick={onUpgrade}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    <span>Przejdź na Premium</span>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Wyloguj się</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
