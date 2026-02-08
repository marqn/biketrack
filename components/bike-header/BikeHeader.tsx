"use client";

import {
  ChevronDown,
  Crown,
  UserIcon,
  LogOut,
  CreditCard,
  Delete,
  Mail,
  History,
  Package,
  Newspaper,
  Home,
  Pencil,
  Shield,
  Plus,
  Check,
  Trash2,
  Lock,
  Compass,
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Bike, BikeType } from "@/lib/generated/prisma";
import { signOut } from "next-auth/react";
import { useNotifications } from "@/app/hooks/useNotifications";
import { deleteAccount } from "./actions/delete-account";
import { deleteBike } from "./actions/delete-bike";
import { updateBike } from "./actions/update-bike";
import {
  RenameBikeDialog,
  DeleteAccountDialog,
  AddEmailDialog,
  ConfirmDeleteDialog,
  AddBikeDialog,
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
    role?: string;
    plan?: "FREE" | "PREMIUM";
  };
}

export type DialogType =
  | "delete-account"
  | "rename-bike"
  | "bike-details"
  | "add-email"
  | "add-bike"
  | "delete-bike"
  | null;

export function BikeHeader({ bike, bikes, user }: BikeHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { activeDialog, openDialog, closeDialog } = useMultiDialog<DialogType>();
  const [bikeToDelete, setBikeToDelete] = useState<string | null>(null);
  const { notifications: unreadNotifications } = useNotifications();
  const unreadCount = unreadNotifications.length;

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPremium = user.plan === "PREMIUM";
  const canAddBike = isPremium && bikes.length < 10;
  const hasMultipleBikes = bikes.length > 1;

  const handleUpdateBike = async (data: {
    brand: string;
    model: string;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    description: string;
  }) => {
    return await updateBike(bike.id, user.id, data);
  };

  const handleSwitchBike = (bikeId: string) => {
    document.cookie = `selectedBikeId=${bikeId};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent("bike-changed"));
    router.refresh();
  };

  const handleDeleteBike = async () => {
    if (!bikeToDelete) return;
    const result = await deleteBike(bikeToDelete);
    if (result.success) {
      // Jeśli usunięto aktywny rower, przełącz na pierwszy dostępny
      if (bikeToDelete === bike.id) {
        const remaining = bikes.filter((b) => b.id !== bikeToDelete);
        if (remaining[0]) {
          document.cookie = `selectedBikeId=${remaining[0].id};path=/;max-age=${60 * 60 * 24 * 365}`;
        }
      }
      setBikeToDelete(null);
      closeDialog();
      router.refresh();
    }
  };

  // Nagłówek roweru: marka + model lub typ gdy brak
  const bikeTitle = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bike.type;

  const getBikeLabel = (b: Bike) => {
    return b.brand || b.model
      ? `${b.brand ?? ""} ${b.model ?? ""}`.trim()
      : b.type;
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      await signOut({
        callbackUrl: "/login",
        redirect: true,
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto">
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg">{bikeTitle}</h1>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bike.type} {bike.totalKm.toLocaleString("pl-PL")} km
                    </p>
                  </div>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="start" className="w-64">
                {/* Lista rowerów */}
                {bikes.map((b) => (
                  <DropdownMenuItem
                    key={b.id}
                    onClick={() => handleSwitchBike(b.id)}
                    className="flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${b.id === bike.id ? "font-semibold" : ""}`}>
                        {getBikeLabel(b)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.type} · {b.totalKm.toLocaleString("pl-PL")} km
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      {b.id === bike.id && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                      {hasMultipleBikes && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBikeToDelete(b.id);
                            openDialog("delete-bike");
                          }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

                {/* Edytuj aktywny rower */}
                <DropdownMenuItem onClick={() => openDialog("rename-bike")}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edytuj rower
                </DropdownMenuItem>

                {/* Dodaj rower - premium lub upgrade CTA */}
                {isPremium ? (
                  <DropdownMenuItem
                    onClick={() => openDialog("add-bike")}
                    disabled={!canAddBike}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    {canAddBike
                      ? "Dodaj rower"
                      : `Limit ${bikes.length}/10 rowerów`}
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => router.push("/app/upgrade")}>
                    <Lock className="mr-2 h-4 w-4" />
                    Odblokuj więcej rowerów
                    <Crown className="ml-auto h-3 w-3 text-yellow-500" />
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          {user.role === "ADMIN" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={pathname?.startsWith("/admin") ? "default" : "destructive"}
                    size="icon"
                    onClick={() => router.push("/admin/bikes")}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Panel Admina</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

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
                <Button variant={pathname?.startsWith("/app/discover") ? "default" : "outline"} size="icon" onClick={() => router.push("/app/discover")}>
                  <Compass className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Odkrywaj</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant={pathname?.startsWith("/app/blog") ? "default" : "outline"} size="icon" onClick={() => router.push("/app/blog")}>
                  <Newspaper className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Aktualności</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={pathname?.startsWith("/app/messages") ? "default" : "outline"}
                  size="icon"
                  className="relative"
                  onClick={() => router.push("/app/messages")}
                >
                  <Mail className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Wiadomości</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar className={`h-9 w-9 ${user.plan === "PREMIUM" ? "ring-2 ring-blue-500" : ""}`}>
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                  {user.plan === "PREMIUM" && (
                    <AvatarBadge className="bg-blue-500 text-white ring-background">
                      <Crown className="size-2!" />
                    </AvatarBadge>
                  )}
                </Avatar>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2">
                <p className="text-sm font-medium">
                  {user.name}{" "}
                  <Badge className="mt-1" variant={user.plan === "PREMIUM" ? "default" : "secondary"}>
                    {user.plan === "PREMIUM" ? "PREMIUM" : "FREE"}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push("/app/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>

              <DropdownMenuItem onClick={() => router.push("/app/upgrade")}>
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
        key={bike.id}
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

      <AddBikeDialog
        open={activeDialog === "add-bike"}
        onOpenChange={(open) => !open && closeDialog()}
      />

      <ConfirmDeleteDialog
        open={activeDialog === "delete-bike"}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setBikeToDelete(null);
            closeDialog();
          }
        }}
        onConfirm={handleDeleteBike}
        title="Usunąć rower?"
        description="Ta operacja jest nieodwracalna. Rower wraz z całą historią serwisów i części zostanie trwale usunięty."
      />
    </header>
  );
}
