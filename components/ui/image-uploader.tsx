"use client";

import { useState, useRef } from "react";
import { upload } from "@vercel/blob/client";
import { deleteBlobImage } from "@/app/app/actions/delete-blob-image";
import { saveBlobImage } from "@/app/app/actions/save-blob-image";
import { Camera, X, Plus, Loader2 } from "lucide-react";
import {
  compressImage,
  IMAGE_ALLOWED_TYPES,
  IMAGE_MAX_SIZE,
  type ImageEntityType,
} from "@/lib/image-compression";

interface ImageUploaderProps {
  images: string[];
  maxImages: number;
  entityType: ImageEntityType;
  entityId: string;
  onImagesChange: (urls: string[]) => void;
  variant?: "grid" | "avatar";
  className?: string;
}

export function ImageUploader({
  images,
  maxImages,
  entityType,
  entityId,
  onImagesChange,
  variant = "grid",
  className = "",
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canAddMore = images.length < maxImages;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input
    if (inputRef.current) inputRef.current.value = "";

    // Walidacja client-side
    if (!IMAGE_ALLOWED_TYPES.includes(file.type)) {
      setError("Dozwolone formaty: JPG, PNG, WebP");
      return;
    }
    if (file.size > IMAGE_MAX_SIZE) {
      setError("Maksymalny rozmiar: 10MB");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const compressedFile = await compressImage(file, entityType);

      const blob = await upload(compressedFile.name, compressedFile, {
        access: "public",
        handleUploadUrl: "/api/upload",
        clientPayload: JSON.stringify({ type: entityType, entityId }),
      });

      // Zapisz URL do bazy danych przez server action
      const result = await saveBlobImage(entityType, entityId, blob.url);
      if (!result.success) {
        setError(result.error || "Błąd podczas zapisywania");
        return;
      }

      onImagesChange(maxImages === 1 ? [blob.url] : [...images, blob.url]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Błąd podczas uploadu";
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (url: string) => {
    setDeleting(url);
    setError(null);

    try {
      const result = await deleteBlobImage(entityType, entityId, url);
      if (result.success) {
        onImagesChange(images.filter((u) => u !== url));
      } else {
        setError(result.error || "Błąd podczas usuwania");
      }
    } catch {
      setError("Błąd podczas usuwania");
    } finally {
      setDeleting(null);
    }
  };

  if (variant === "avatar") {
    const currentImage = images[0] || null;
    return (
      <div className={`flex flex-col items-center gap-2 ${className}`}>
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-2 border-dashed border-muted-foreground/25 flex items-center justify-center overflow-hidden bg-muted/50">
            {currentImage ? (
              <img
                src={currentImage}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <Camera className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          {currentImage && (
            <button
              type="button"
              onClick={() => handleDelete(currentImage)}
              disabled={deleting === currentImage}
              className="absolute -top-1 -right-1 p-1 rounded-full bg-background border shadow-sm hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              {deleting === currentImage ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
          )}
          {uploading && (
            <div className="absolute inset-0 rounded-full bg-background/60 flex items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
        </div>
        <label className="cursor-pointer text-sm text-primary hover:underline">
          {currentImage ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
        </label>
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    );
  }

  // Grid variant
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {images.map((url) => (
          <div
            key={url}
            className="relative w-24 h-24 rounded-lg border overflow-hidden bg-muted/50 group"
          >
            <img
              src={url}
              alt="Zdjęcie"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => handleDelete(url)}
              disabled={deleting === url}
              className="absolute top-1 right-1 p-0.5 rounded-full bg-background/80 hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
            >
              {deleting === url ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <X className="h-3 w-3" />
              )}
            </button>
          </div>
        ))}

        {canAddMore && (
          <label className="w-24 h-24 rounded-lg border-2 border-dashed border-muted-foreground/25 flex flex-col items-center justify-center gap-1 cursor-pointer text-muted-foreground hover:text-foreground hover:border-foreground/25 transition-colors bg-muted/50">
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <>
                <Plus className="h-5 w-5" />
                <span className="text-[10px]">
                  {images.length === 0 ? "Dodaj zdjęcie" : "Dodaj"}
                </span>
              </>
            )}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              disabled={uploading}
            />
          </label>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      {maxImages > 1 && (
        <p className="text-xs text-muted-foreground">
          {images.length}/{maxImages} zdjęć (JPG/PNG/WebP, kompresowane automatycznie)
        </p>
      )}
    </div>
  );
}
