"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bike as BikeIcon, MapPin, LogIn } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";
import { BikeType, PartType } from "@/lib/generated/prisma";
import { BikePublicParts } from "./BikePublicParts";
import { BikeCommentSection } from "./BikeCommentSection";
import Link from "next/link";

interface BikePublicViewProps {
  bike: {
    id: string;
    brand: string | null;
    model: string | null;
    year: number | null;
    type: BikeType;
    description: string | null;
    isElectric: boolean;
    totalKm: number;
    imageUrl: string | null;
    slug: string | null;
    user: {
      id: string;
      name: string | null;
      image: string | null;
      profileSlug: string | null;
    };
    parts: Array<{
      id: string;
      type: PartType;
      wearKm: number;
      expectedKm: number;
      isInstalled: boolean;
      product: {
        id: string;
        brand: string;
        model: string;
        type: string;
        averageRating: number | null;
        totalReviews: number;
      } | null;
    }>;
    _count: { comments: number };
  };
  isOwner: boolean;
  isLoggedIn: boolean;
  currentUserId?: string;
}

export function BikePublicView({ bike, isOwner, isLoggedIn, currentUserId }: BikePublicViewProps) {
  const bikeTitle = bike.brand || bike.model
    ? `${bike.brand ?? ""} ${bike.model ?? ""}`.trim()
    : bikeTypeLabels[bike.type];

  const initials = bike.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  return (
    <div className="space-y-6">
      {/* Header z informacjami o rowerze */}
      <div className="bg-card rounded-xl border overflow-hidden">
        {/* Zdjęcie roweru */}
        {isLoggedIn ? (
          bike.imageUrl ? (
            <div className="w-full h-64 bg-muted">
              <img
                src={bike.imageUrl}
                alt={bikeTitle}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-40 bg-muted flex items-center justify-center">
              <BikeIcon className="h-16 w-16 text-muted-foreground/30" />
            </div>
          )
        ) : (
          <div className="w-full h-40 bg-muted flex items-center justify-center">
            <BikeIcon className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold">{bikeTitle}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="secondary">{bikeTypeLabels[bike.type]}</Badge>
                {bike.year && <Badge variant="outline">{bike.year}</Badge>}
                {bike.isElectric && <Badge variant="outline">E-bike</Badge>}
              </div>
            </div>

            {isLoggedIn && (
              <div className="text-right">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span className="text-xl font-semibold text-foreground">
                    {bike.totalKm.toLocaleString("pl-PL")}
                  </span>
                  <span className="text-sm">km</span>
                </div>
              </div>
            )}
          </div>

          {bike.description && (
            <p className="mt-4 text-muted-foreground">{bike.description}</p>
          )}

          {/* Właściciel */}
          <div className="mt-4 pt-4 border-t flex items-center gap-3">
            {bike.user.profileSlug ? (
              <Link
                href={`/app/discover/user/${bike.user.profileSlug}`}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={bike.user.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{bike.user.name ?? "Użytkownik"}</span>
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={bike.user.image ?? undefined} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{bike.user.name ?? "Użytkownik"}</span>
              </div>
            )}
            {isOwner && (
              <Badge variant="outline" className="ml-auto">Twój rower</Badge>
            )}
          </div>
        </div>
      </div>

      {/* Zachęta do rejestracji */}
      {!isLoggedIn && (
        <div className="bg-card rounded-xl border p-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 space-y-1">
            <p className="font-semibold">
              {bike.user.name ?? "Użytkownik"} udostępnia swój rower {bikeTitle}
            </p>
            <p className="text-sm text-muted-foreground">
              Dołącz do społeczności, śledź swoje części, dziel się swoim rowerem i komentuj inne.
            </p>
          </div>
          <Link href="/login">
            <Button>
              <LogIn className="size-4 mr-2" />
              Dołącz
            </Button>
          </Link>
        </div>
      )}

      {/* Części i komentarze - tylko dla zalogowanych */}
      {isLoggedIn && (
        <>
          <BikePublicParts parts={bike.parts} />
          <BikeCommentSection
            bikeId={bike.id}
            isLoggedIn={isLoggedIn}
            currentUserId={currentUserId}
            commentCount={bike._count.comments}
          />
        </>
      )}
    </div>
  );
}
