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
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

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

type MenuItemType = {
  name: string;
  path?: string;
  dialog?: DialogType;
};

const menuItems: MenuItemType[] = [
  { name: "Twój rower", path: "/app" },
  { name: "Edytuj rower", dialog: "rename-bike" },
  { name: "Historia", path: "/app/history" },
  { name: "Produkty", path: "/app/products" },
  { name: "Ustawki", path: "/app/test" },
];

type SyncStatus = "synced" | "syncing" | "error";

export function BikeHeader({ bike, user }: BikeHeaderProps) {
  const router = useRouter();
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

  const handleMenuClick = (item: MenuItemType) => {
    if (item.dialog) {
      openDialog(item.dialog);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const handleUpdateBike = async (data: {
    name: string;
    brand: string;
    model: string;
    type: BikeType; // ← Bez pustego stringa
  }) => {
    return await updateBike(bike.id, user.id, data);
  };

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
        {mounted && (
          <TooltipProvider>
            <Tooltip
              open={mounted && !hasSeenTooltip}
              onOpenChange={(open) => {
                if (!open) setHasSeenTooltip(true);
              }}
            >
              <TooltipTrigger asChild>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="p-0 h-auto">
                        <div className="text-left">
                          <div className="flex items-center gap-2">
                            <h1 className="text-lg">{bike.name}</h1>
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {bike.brand} {bike.model}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {bike.type}{" "}
                            {mounted
                              ? bike.totalKm.toLocaleString("pl-PL")
                              : bike.totalKm}{" "}
                            km
                          </p>
                        </div>
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="start" className="w-64">
                      {menuItems.map((item) => (
                        <DropdownMenuItem
                          key={item.name}
                          onClick={() => handleMenuClick(item)}
                        >
                          {item.name}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TooltipTrigger>
              {bike.brand || bike.model ? null : (
                <TooltipContent>
                  <p>Kliknij, aby edytować rower lub dodać nowy</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        )}

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {syncIcon[syncStatus]}
          </div>

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
