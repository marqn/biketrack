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
  Home,
  Pencil,
  Shield,
  Plus,
  Trash2,
  Lock,
  Compass,
  Warehouse,
  Bike as BikeIcon,
  Sun,
  Moon,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  AvatarBadge,
} from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { Bike, BikeType } from "@/lib/generated/prisma";
import { signOut, useSession } from "next-auth/react";
import { useNotifications } from "@/app/hooks/useNotifications";
import { formatDistance } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";
import { toast } from "sonner";
import { useStravaSync } from "@/components/strava-sync-context";
import { useTheme } from "next-themes";
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
import { getReputationTier } from "@/components/discover/ReputationBadge";

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
    reputation?: number;
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

export function BikeHeader({
  bike,
  bikes,
  user,
}: BikeHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [pendingHref, setPendingHref] = useState<string | null>(null);

  const navigate = (href: string) => {
    setPendingHref(href);
    router.push(href);
  };

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const isActive = (href: string, exact = false) => {
    const current = pendingHref ?? pathname;
    return exact ? current === href : !!current?.startsWith(href);
  };

  // Nadaje view-transition-name aktywnej ikonie nawigacyjnej,
  // dzięki czemu "pill" ślizga się między przyciskami podczas nawigacji.
  const pill = (active: boolean): React.CSSProperties | undefined =>
    active ? { viewTransitionName: "nav-pill" } : undefined;
  const { data: session } = useSession();
  const { resolvedTheme: theme, setTheme } = useTheme();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";
  const { activeDialog, openDialog, closeDialog } =
    useMultiDialog<DialogType>();
  const [bikeToDelete, setBikeToDelete] = useState<string | null>(null);
  const [bikeToEdit, setBikeToEdit] = useState<Bike | null>(null);
  const { notifications: unreadNotifications } = useNotifications();
  const unreadCount = unreadNotifications.length;
  const stravaSync = useStravaSync();

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const isPremium = user.plan === "PREMIUM";
  const canAddBike = isPremium && bikes.length < 10;
  const reputationTier = getReputationTier(user.reputation ?? 0);
  const avatarRingClass = reputationTier.borderClass || (isPremium ? "ring-2 ring-blue-500" : "");
  const hasMultipleBikes = bikes.length > 1;

  const handleUpdateBike = async (data: {
    brand: string;
    model: string;
    year: number | null;
    type: BikeType;
    isElectric: boolean;
    description: string;
  }) => {
    return await updateBike((bikeToEdit ?? bike).id, user.id, data);
  };

  const handleSwitchBike = (bikeId: string) => {
    if (bikeId === bike.id) return;
    document.cookie = `selectedBikeId=${bikeId};path=/;max-age=${60 * 60 * 24 * 365}`;
    window.dispatchEvent(new CustomEvent("bike-changed"));
    router.refresh();
  };

  const handleDeleteBike = async () => {
    if (!bikeToDelete) return;
    const deletedBike = bikes.find((b) => b.id === bikeToDelete);
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
      toast.success("Rower został usunięty", {
        description: deletedBike
          ? `${deletedBike.brand ?? ""} ${deletedBike.model ?? ""}`.trim() || undefined
          : undefined,
      });
      router.refresh();
    } else {
      toast.error(result.error || "Nie udało się usunąć roweru");
    }
  };

  // Nagłówek roweru: marka + model lub typ gdy brak
  const bikeTitle =
    bike.brand || bike.model
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
        callbackUrl: "/",
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

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 z-50 w-screen border-b bg-card">
        <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-3 flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-1">
          <div className="order-1 flex-1 min-w-0 space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="order-2 md:order-last shrink-0">
            <Skeleton className="h-9 w-9 rounded-full" />
          </div>
          <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-center md:justify-normal gap-2 sm:gap-3 md:gap-4 shrink-0">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-9 w-9 rounded-md" />
            ))}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 z-50 w-screen border-b bg-card" style={{ viewTransitionName: "nav-header" }}>
      <div className="container mx-auto px-2 sm:px-6 lg:px-8 py-3 flex flex-wrap md:flex-nowrap items-center gap-x-4 gap-y-1">
          {/* BIKE SWITCHER - wiersz 1 lewa */}
          <div className="order-1 flex-1 min-w-0 overflow-hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 h-auto gap-2 max-w-full overflow-hidden">
                  {(bike.images[0] || bike.imageUrl) && (() => {
                    const src = bike.images[0] || bike.imageUrl!;
                    return (
                      <div className="relative h-9 w-9 rounded-md overflow-hidden shrink-0 border">
                        {src.startsWith("data:") ? (
                          <img src={src} alt={bikeTitle} className="h-full w-full object-cover" />
                        ) : (
                          <Image src={src} alt={bikeTitle} fill sizes="36px" className="object-cover" />
                        )}
                      </div>
                    );
                  })()}
                  <div className="text-left min-w-0 overflow-hidden">
                    <div className="flex items-center gap-2">
                      <h1 className="text-lg truncate">{bikeTitle}</h1>
                      <ChevronDown className="h-3 w-3 text-muted-foreground" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {bike.type} {formatDistance(bike.totalKm, unitPref)}
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
                    className={`flex items-center justify-between relative pl-3 ${b.id === bike.id ? "bg-primary/10" : ""}`}
                  >
                    {b.id === bike.id && (
                      <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-primary" />
                    )}
                    <div className="relative h-8 w-8 rounded-md overflow-hidden shrink-0 border bg-muted flex items-center justify-center mr-2">
                      {(b.images[0] || b.imageUrl) ? (
                        (() => {
                          const src = b.images[0] || b.imageUrl!;
                          return src.startsWith("data:") ? (
                            <img src={src} alt={getBikeLabel(b)} className="h-full w-full object-cover" />
                          ) : (
                            <Image src={src} alt={getBikeLabel(b)} fill sizes="32px" className="object-cover" />
                          );
                        })()
                      ) : (
                        <BikeIcon className={`h-4 w-4 ${b.id === bike.id ? "text-primary" : "text-muted-foreground"}`} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className={`text-sm truncate ${b.id === bike.id ? "font-semibold text-primary" : ""}`}
                      >
                        {getBikeLabel(b)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {b.type} · {formatDistance(b.totalKm, unitPref)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBikeToEdit(b);
                          openDialog("rename-bike");
                        }}
                        className="p-1 rounded hover:bg-blue-500/10 text-muted-foreground hover:text-blue-500! transition-colors"
                      >
                        <Pencil className="h-3 w-3" />
                      </button>
                      {hasMultipleBikes && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setBikeToDelete(b.id);
                            openDialog("delete-bike");
                          }}
                          className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive! transition-colors"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}

                <DropdownMenuSeparator />

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
          </div>

        {/* AVATAR - wiersz 1 prawa na mobile, ostatni na desktop */}
        <div className="order-2 md:order-last shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar className={`h-9 w-9 ${avatarRingClass}`}>
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
                  <Badge
                    className="mt-1"
                    variant={user.plan === "PREMIUM" ? "default" : "secondary"}
                  >
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

              <DropdownMenuItem
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? (
                  <Sun className="mr-2 h-4 w-4" />
                ) : (
                  <Moon className="mr-2 h-4 w-4" />
                )}
                {theme === "dark" ? "Tryb jasny" : "Tryb ciemny"}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openDialog("delete-account")}>
                <Delete className="mr-2 h-4 w-4" />
                Usuń konto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* NAV BUTTONS - wiersz 2 wyśrodkowane na mobile, środek na desktop */}
        <div className="order-3 md:order-2 w-full md:w-auto flex items-center justify-center md:justify-normal gap-3.5 sm:gap-4.5 md:gap-4 shrink-0">
          {user.role === "ADMIN" && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant={
                      isActive("/admin") ? "default" : "destructive"
                    }
                    size="icon"
                    onClick={() => router.push("/admin/bikes")}
                  >
                    <Shield className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-primary-foreground">
                  <p>Panel Admina</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive("/app", true) ? "default" : "outline"}
                  size="icon"
                  style={pill(isActive("/app", true))}
                  onClick={() => navigate("/app")}
                >
                  <Home className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground">
                <p>Strona startowa</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive("/app/history") ? "default" : "outline"}
                  size="icon"
                  style={pill(isActive("/app/history"))}
                  onClick={() => navigate("/app/history")}
                >
                  <History className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground">
                <p>Historia</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive("/app/garage") ? "default" : "outline"}
                  size="icon"
                  style={pill(isActive("/app/garage"))}
                  onClick={() => navigate("/app/garage")}
                >
                  <Warehouse className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground">
                <p>Garaż</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive("/app/products") ? "default" : "outline"}
                  size="icon"
                  style={pill(isActive("/app/products"))}
                  onClick={() => navigate("/app/products")}
                >
                  <Package className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground">
                <p>Produkty</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive("/app/discover") ? "default" : "outline"}
                  size="icon"
                  style={pill(isActive("/app/discover"))}
                  onClick={() => navigate("/app/discover")}
                >
                  <Compass className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground">
                <p>Odkrywaj</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={isActive("/app/messages") ? "default" : "outline"}
                  size="icon"
                  style={pill(isActive("/app/messages"))}
                  className="relative"
                  onClick={() => navigate("/app/messages")}
                >
                  <Mail className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-primary-foreground">
                <p>Wiadomości</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

        </div>
      </div>

      {/* DIALOGS */}
      <RenameBikeDialog
        key={(bikeToEdit ?? bike).id}
        open={activeDialog === "rename-bike"}
        onOpenChange={(open) => { if (!open) { setBikeToEdit(null); closeDialog(); } }}
        bike={bikeToEdit ?? bike}
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
