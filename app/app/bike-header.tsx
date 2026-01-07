"use client";

import {
  Check,
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

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { Bike, Plan } from "@/lib/generated/prisma";
import { JSX } from "react";
import { signOut } from "next-auth/react";
import { deleteAccount } from "./actions/delete-account";

interface BikeHeaderProps {
  bike: Bike;
  bikes: Bike[];
  user: {
    name: string;
    email: string;
    image?: string | null;
    plan: Plan;
  };
}

export function BikeHeader({ bike, bikes, user }: BikeHeaderProps) {
  const router = useRouter();

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

  const handleDeleteAccount = async () => {
    await deleteAccount();
  };

  return (
    <header className="fixed top-0 left-0 z-50 w-screen border-b bg-card">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* BIKE SWITCHER */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="p-0 h-auto">
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">{bike.name}</h1>
                  {bikes.length > 1 && (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {bike.totalKm.toLocaleString("pl-PL")} km
                </p>
              </div>
            </Button>
          </DropdownMenuTrigger>

          {bikes.length > 1 ? (
            <DropdownMenuContent align="start" className="w-64">
              {bikes.map((b) => (
                <DropdownMenuItem
                  key={b.id}
                  onClick={() => router.push(`/app/bike/${b.id}`)}
                  className="flex justify-between"
                >
                  <div>
                    <div className="font-medium">{b.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {b.totalKm.toLocaleString("pl-PL")} km
                    </div>
                  </div>
                  {b.id === bike.id && <Check className="h-4 w-4" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          ) : null}
        </DropdownMenu>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm">
            {syncIcon[bike.syncStatus]}
            {/* <span className="hidden sm:inline text-muted-foreground">
              {syncText[bike.syncStatus]}
            </span> */}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="p-0">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <div className="p-2 ">
                <p className="text-sm font-medium justify-center">
                  {user.name}{" "}
                  <Badge
                    className="mt-1"
                    variant={
                      user.plan === Plan.PREMIUM ? "default" : "secondary"
                    }
                  >
                    {user.plan}
                  </Badge>
                </p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>

              <DropdownMenuSeparator />

              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>

              {user.plan === Plan.FREE && (
                <DropdownMenuItem onClick={() => router.push("/upgrade")}>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Premium
                </DropdownMenuItem>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Wyloguj
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDeleteAccount}>
                <Delete className="mr-2 h-4 w-4" />
                Usuń konto
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
