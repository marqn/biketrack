import imageCompression from "browser-image-compression";

export type ImageEntityType = "bike" | "part" | "avatar" | "review";

export const IMAGE_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB

interface CompressionConfig {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  fileType: string;
}

const COMPRESSION_CONFIGS: Record<ImageEntityType, CompressionConfig> = {
  bike: {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    fileType: "image/webp",
  },
  part: {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    fileType: "image/webp",
  },
  avatar: {
    maxSizeMB: 0.3,
    maxWidthOrHeight: 512,
    fileType: "image/webp",
  },
  review: {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200,
    fileType: "image/webp",
  },
};

export async function compressImage(
  file: File,
  entityType: ImageEntityType
): Promise<File> {
  const config = COMPRESSION_CONFIGS[entityType];

  // Pomijaj kompresję dla bardzo małych plików
  if (file.size < 100 * 1024) {
    return file;
  }

  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: config.maxSizeMB,
      maxWidthOrHeight: config.maxWidthOrHeight,
      useWebWorker: true,
      fileType: config.fileType,
      initialQuality: 0.8,
      preserveExif: false,
    });

    const newName = file.name.replace(/\.(jpe?g|png|webp)$/i, ".webp");

    return new File([compressedFile], newName, {
      type: config.fileType,
    });
  } catch (error) {
    console.error("Kompresja nie powiodła się, używam oryginału:", error);
    return file;
  }
}
