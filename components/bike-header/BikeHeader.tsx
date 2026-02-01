"use client";

import {
  ChevronDown,
  Wifi,
  WifiOff,
  Loader2,
  UserIcon,
  LogOut,
  CreditCard,
  Delete,
  Mail,
  Users,
  History,
  Package,
  Settings,
  Home,
  Pencil,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
// DropdownMenuContent i DropdownMenuItem używane w menu użytkownika
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Bike, BikeType } from "@/lib/generated/prisma";
import { JSX } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "./actions/delete-account";
import { updateBike } from "./actions/update-bike";
import {
  RenameBikeDialog,
  DeleteAccountDialog,
  AddEmailDialog,
} from "./dialogs";
import { useMultiDialog } from "@/lib/hooks/useDialog";

interface BikeHeaderProps {
  bike: Bike;
  bikes: Bike[];
  user: {
    id: string;
    name: string;
    email: string;
    image?: string | null;
  };
}

export type DialogType =
  | "delete-account"
  | "rename-bike"
  | "bike-details"
  | "add-email"
  | null;

type SyncStatus = "synced" | "syncing" | "error";

export function BikeHeader({ bike, user }: BikeHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeDialog, openDialog, closeDialog } = useMultiDialog<DialogType>();
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("synced");

  const syncIcon: Record<SyncStatus, JSX.Element> = {
    synced: <Wifi className="h-4 w-4 text-emerald-500" />,
    syncing: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
    error: <WifiOff className="h-4 w-4 text-destructive" />,
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleUpdateBike = async (data: {
    brand: string;
    model: string;
    type: BikeType;
  }) => {
    return await updateBike(bike.id, user.id, data);
  };

  // Nagłówek roweru: marka + model lub typ gdy brak
  const bikeTitle = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bike.type;

  const handleDeleteAccount = async () => {
  try {
    // 1. Usuń konto z bazy danych
    await deleteAccount();
    
    // 2. Wyloguj użytkownika i przekieruj na /login
    await signOut({ 
      callbackUrl: "/login",
      redirect: true 
    });
  } catch (error) {
    console.error("Error deleting account:", error);
    alert("Wystąpił błąd podczas usuwania konta");
  }
};
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      openDialog("add-email");
    };

    window.addEventListener("open-email-dialog", handler);
    return () => window.removeEventListener("open-email-dialog", handler);
  }, []);

  return (
    <header className="fixed top-0 left-0 z-50 w-screen border-b bg-card">
      <div className="container mx-auto px-8 py-3 flex items-center justify-between">
        {/* BIKE SWITCHER */}
        <div className="min-w-35">
          {!mounted ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          ) : (
            <TooltipProvider>
              <Tooltip
                open={!hasSeenTooltip}
                onOpenChange={(open) => {
                  if (!open) setHasSeenTooltip(true);
                }}
              >
                <TooltipTrigger asChild>
                  <Button variant="ghost" className="p-0 h-auto" onClick={() => openDialog("rename-bike")}>
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <h1 className="text-lg">{bikeTitle}</h1>
                        <Pencil className="h-3 w-3 text-muted-foreground" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {bike.type} {bike.totalKm.toLocaleString("pl-PL")} km
                      </p>
                    </div>
                  </Button>
                </TooltipTrigger>
                {bike.brand || bike.model ? null : (
                  <TooltipContent>
                    <p>Kliknij, aby edytować rower lub dodać nowy</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {/* <div className="flex items-center gap-2 text-sm">
            {syncIcon[syncStatus]}
          </div> */}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={pathname === "/app" ? "default" : "outline"} size="icon" onClick={() => router.push("/app")}>
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Strona startowa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={() => openDialog("add-email")}>
                  <Mail className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Powiadomienia</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={pathname?.startsWith("/app/test/races") ? "default" : "outline"} size="icon" onClick={() => router.push("/app/test/races")}>
                  <Users className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Wyścigi</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={pathname?.startsWith("/app/history") ? "default" : "outline"} size="icon" onClick={() => router.push("/app/history")}>
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Historia</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={pathname?.startsWith("/app/products") ? "default" : "outline"} size="icon" onClick={() => router.push("/app/products")}>
                  <Package className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Produkty</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={pathname === "/app/test" ? "default" : "outline"} size="icon" onClick={() => router.push("/app/test")}>
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ustawki</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium">
                  {user.name}{" "}
                  <Badge className="mt-1" variant="default">
                    FREE
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push("/app/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Premium
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => openDialog("delete-account")}
              >
                <Delete className="mr-2 h-4 w-4" />
                Usuń konto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* DIALOGS */}
      <RenameBikeDialog
        open={activeDialog === "rename-bike"}
        onOpenChange={(open) => !open && closeDialog()}
        bike={bike}
        onSave={handleUpdateBike}
      />

      <DeleteAccountDialog
        open={activeDialog === "delete-account"}
        onOpenChange={(open) => !open && closeDialog()}
        onConfirm={handleDeleteAccount}
      />

      <AddEmailDialog
        open={activeDialog === "add-email"}
        onOpenChange={(open) => !open && closeDialog()}
      />
    </header>
  );
}
