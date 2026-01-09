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
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Bike, BikeType, Plan } from "@/lib/generated/prisma";
import { JSX } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "./actions/delete-account";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { bikeTypeLabels } from "../../app/onboarding/OnboardingClient";
import { RenameBikeDialog, DeleteAccountDialog } from "./dialogs";

interface BikeHeaderProps {
  bike: Bike;
  bikes: Bike[];
  user: {
    name: string;
    email: string;
    image?: string | null;
    // plan: Plan;
  };
}

type DialogType = "delete-account" | "rename-bike" | null;


type MenuItemType = {
  name: string;
  path?: string;
  dialog?: DialogType;
};

const menuItems: MenuItemType[] = [
  { name: "Twój rower", path: "/app" },
  { name: "Zmień Nazwę", dialog: "rename-bike" },
  { name: "Test", path: "/app/test" },
];

export function BikeHeader({ bike, user }: BikeHeaderProps) {
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [hasSeenTooltip, setHasSeenTooltip] = useState(false);
  const [newBikeName, setNewBikeName] = useState(bike.name);

  const [bikeBrand, setBikeBrand] = useState(bike.brand ?? "");
  const [bikeModel, setBikeModel] = useState(bike.model ?? "");
  const [bikeType, setBikeType] = useState<BikeType | "">(bike.type ?? "");

  const syncIcon: Record<SyncStatus, JSX.Element> = {
    synced: <Wifi className="h-4 w-4 text-emerald-500" />,
    syncing: <Loader2 className="h-4 w-4 animate-spin text-yellow-500" />,
    error: <WifiOff className="h-4 w-4 text-destructive" />,
  };

  const syncText: Record<SyncStatus, string> = {
    synced: "Zsynchronizowany",
    syncing: "Synchronizacja…",
    error: "Błąd synchronizacji",
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleMenuClick = (item: MenuItemType) => {
    if (item.dialog) {
      setActiveDialog(item.dialog);
    } else if (item.path) {
      router.push(item.path);
    }
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    setActiveDialog(null);
  };

  const handleRenameBike = async () => {
    // TODO: Dodaj akcję do zmiany nazwy roweru
    console.log("Nowa nazwa:", newBikeName);
    setActiveDialog(null);
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-screen border-b bg-card">
      <div className="container mx-auto px-8 py-3 flex items-center justify-between">
        {/* BIKE SWITCHER */}
        <TooltipProvider>
          <Tooltip
            open={!hasSeenTooltip}
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
                          <h1 className="text-lg font-semibold">{bike.name}</h1>
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {bike.totalKm.toLocaleString("pl-PL")} km
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
            <TooltipContent>
              <p>Kliknij, aby zmienić nazwę lub dodać inny rower</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {syncIcon[bike.syncStatus]}
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
              <div className="p-2 ">
                <p className="text-sm font-medium justify-center">
                  {user.name}{" "}
                  <Badge className="mt-1" variant={"default"}>
                    FREE
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>

              {/* {user.plan === Plan.FREE && ( */}
              <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                <CreditCard className="mr-2 h-4 w-4" />
                Premium
              </DropdownMenuItem>
              {/* )} */}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setActiveDialog("delete-account")}
              >
                <Delete className="mr-2 h-4 w-4" />
                Usuń konto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <RenameBikeDialog
        open={activeDialog === "rename-bike"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        bike={bike}
        onSave={handleRenameBike}
      />

      <DeleteAccountDialog
        open={activeDialog === "delete-account"}
        onOpenChange={(open) => !open && setActiveDialog(null)}
        onConfirm={handleDeleteAccount}
      />
    </header>
  );
}
