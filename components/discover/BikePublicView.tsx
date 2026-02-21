"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { displayKm, distanceUnit } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogOverlay, DialogPortal } from "@/components/ui/dialog";
import { Bike as BikeIcon, MapPin, LogIn, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Watermark } from "@/components/ui/watermark";
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
    images?: string[];
    imageUrl?: string | null;
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
      partSpecificData?: unknown;
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
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";
  const [imageOpen, setImageOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const allImages = bike.images?.length ? bike.images : bike.imageUrl ? [bike.imageUrl] : [];
  const hasImages = allImages.length > 0;
  const hasMultipleImages = allImages.length > 1;

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
        {/* Zdjęcia roweru */}
        {hasImages ? (
          <div
            className="relative w-full h-64 bg-muted cursor-pointer group"
            onClick={() => setImageOpen(true)}
          >
            <img
              src={allImages[currentImageIndex]}
              alt={bikeTitle}
              className="w-full h-full object-cover"
            />
            <Watermark />
            {hasMultipleImages && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length);
                  }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex((i) => (i + 1) % allImages.length);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                      className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="w-full h-40 bg-muted flex items-center justify-center">
            <BikeIcon className="h-16 w-16 text-muted-foreground/30" />
          </div>
        )}

        {/* Pełnoekranowe zdjęcie */}
        {hasImages && (
          <Dialog open={imageOpen} onOpenChange={setImageOpen}>
            <DialogPortal>
              <DialogOverlay className="bg-black/80" />
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onClick={() => setImageOpen(false)}
              >
                <button
                  onClick={() => setImageOpen(false)}
                  className="absolute top-4 right-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                >
                  <X className="h-6 w-6" />
                  <span className="sr-only">Zamknij</span>
                </button>
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((i) => (i - 1 + allImages.length) % allImages.length);
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentImageIndex((i) => (i + 1) % allImages.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
                <div className="relative inline-flex" onClick={(e) => e.stopPropagation()}>
                  <img
                    src={allImages[currentImageIndex]}
                    alt={bikeTitle}
                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                  />
                  <Watermark />
                </div>
                {hasMultipleImages && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {allImages.map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(i); }}
                        className={`w-2.5 h-2.5 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </DialogPortal>
          </Dialog>
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
                    {displayKm(bike.totalKm, unitPref).toLocaleString("pl-PL")}
                  </span>
                  <span className="text-sm">{distanceUnit(unitPref)}</span>
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
          <BikePublicParts parts={bike.parts} bikeType={bike.type} />
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
