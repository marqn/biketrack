"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PartType } from "@/lib/generated/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import NumberStepper from "@/components/ui/number-stepper";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createPartProduct,
  updatePartProduct,
  deletePartProduct,
} from "../_actions/part-products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PART_NAMES } from "@/lib/default-parts";
import { Copy, Check } from "lucide-react";
import { ImageUploader } from "@/components/ui/image-uploader";
import {
  getDefaultSpecificData,
  hasSpecificFields,
  type TireSpecificData,
  type ChainSpecificData,
  type CassetteSpecificData,
  type PadsSpecificData,
  type ForkSpecificData,
  type SeatpostSpecificData,
  type SpokesSpecificData,
  type RimsSpecificData,
  type HubsSpecificData,
  type FrameSpecificData,
  type BottomBracketSpecificData,
  type CranksetSpecificData,
  type DerailleurRearSpecificData,
  type PedalsSpecificData,
  type DiscSpecificData,
  type StemSpecificData,
  type HeadsetSpecificData,
  type HandlebarSpecificData,
  type HandlebarTapeSpecificData,
  type ShiftersSpecificData,
  type BrakeCaliperSpecificData,
  type SuspensionSpecificData,
  type TubelessSealantSpecificData,
  type InnerTubeSpecificData,
  type LubricantSpecificData,
  type MotorSpecificData,
  type BatterySpecificData,
} from "@/lib/part-specific-data";
import TireFields from "@/components/part-card/specific-fields/TireFields";
import ChainFields from "@/components/part-card/specific-fields/ChainFields";
import CassetteFields from "@/components/part-card/specific-fields/CassetteFields";
import PadsFields from "@/components/part-card/specific-fields/PadsFields";
import ForkFields from "@/components/part-card/specific-fields/ForkFields";
import SeatpostFields from "@/components/part-card/specific-fields/SeatpostFields";
import SpokesFields from "@/components/part-card/specific-fields/SpokesFields";
import RimsFields from "@/components/part-card/specific-fields/RimsFields";
import HubsFields from "@/components/part-card/specific-fields/HubsFields";
import FrameFields from "@/components/part-card/specific-fields/FrameFields";
import BottomBracketFields from "@/components/part-card/specific-fields/BottomBracketFields";
import CranksetFields from "@/components/part-card/specific-fields/CranksetFields";
import DerailleurRearFields from "@/components/part-card/specific-fields/DerailleurRearFields";
import PedalsFields from "@/components/part-card/specific-fields/PedalsFields";
import DiscFields from "@/components/part-card/specific-fields/DiscFields";
import BrakeCaliperFields from "@/components/part-card/specific-fields/BrakeCaliperFields";
import StemFields from "@/components/part-card/specific-fields/StemFields";
import HeadsetFields from "@/components/part-card/specific-fields/HeadsetFields";
import HandlebarFields from "@/components/part-card/specific-fields/HandlebarFields";
import HandlebarTapeFields from "@/components/part-card/specific-fields/HandlebarTapeFields";
import ShiftersFields from "@/components/part-card/specific-fields/ShiftersFields";
import LubricantFields from "@/components/part-card/specific-fields/LubricantFields";

interface PartProductFormProps {
  initialData?: {
    id: string;
    type: PartType;
    brand: string;
    model: string;
    specifications?: Record<string, unknown> | null;
    officialImageUrl?: string | null;
    officialPrice?: string | number | null;
    averageRating?: number | null;
    totalReviews?: number | null;
    averageKmLifespan?: number | null;
    totalInstallations?: number | null;
  };
}

export function PartProductForm({ initialData }: PartProductFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [partType, setPartType] = useState<PartType>(
    initialData?.type || PartType.CHAIN
  );
  const [brand, setBrand] = useState(initialData?.brand || "");
  const [model, setModel] = useState(initialData?.model || "");
  const [specifications, setSpecifications] = useState<Record<string, unknown>>(
    (initialData?.specifications as Record<string, unknown>) ||
      (getDefaultSpecificData(initialData?.type || PartType.CHAIN) as Record<string, unknown>)
  );
  const [officialPrice, setOfficialPrice] = useState<string>(
    initialData?.officialPrice?.toString() || ""
  );
  const [averageRating, setAverageRating] = useState<string>(
    initialData?.averageRating?.toString() || "0"
  );
  const [totalReviews, setTotalReviews] = useState<string>(
    initialData?.totalReviews?.toString() || "0"
  );
  const [averageKmLifespan, setAverageKmLifespan] = useState<string>(
    initialData?.averageKmLifespan?.toString() || "0"
  );
  const [totalInstallations, setTotalInstallations] = useState<string>(
    initialData?.totalInstallations?.toString() || "0"
  );
  const [officialImageUrl, setOfficialImageUrl] = useState<string | null>(initialData?.officialImageUrl || null);
  const [copied, setCopied] = useState(false);

  function handlePartTypeChange(newType: PartType) {
    setPartType(newType);
    setSpecifications(
      getDefaultSpecificData(newType) as Record<string, unknown>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const data = {
        type: partType,
        brand,
        model,
        specifications: hasSpecificFields(partType) ? specifications : null,
        officialPrice: officialPrice ? parseFloat(officialPrice) : null,
        averageRating: averageRating ? parseFloat(averageRating) : 0,
        totalReviews: totalReviews ? parseInt(totalReviews) : 0,
        averageKmLifespan: averageKmLifespan ? parseInt(averageKmLifespan) : 0,
        totalInstallations: totalInstallations ? parseInt(totalInstallations) : 0,
      };

      if (initialData) {
        await updatePartProduct(initialData.id, data);
      } else {
        await createPartProduct(data);
      }
      router.push("/admin/parts");
    });
  }

  function handleDelete() {
    if (!initialData) return;
    if (!confirm("Czy na pewno chcesz usunac ta czesc?")) return;

    startTransition(async () => {
      await deletePartProduct(initialData.id);
      router.push("/admin/parts");
    });
  }

  function renderSpecificFields() {
    if (!hasSpecificFields(partType)) return null;

    switch (partType) {
      case PartType.FRAME:
        return (
          <FrameFields
            data={specifications as Partial<FrameSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.TIRE_FRONT:
      case PartType.TIRE_REAR:
        return (
          <TireFields
            data={specifications as Partial<TireSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.CHAIN:
        return (
          <ChainFields
            data={specifications as Partial<ChainSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.CASSETTE:
        return (
          <CassetteFields
            data={specifications as Partial<CassetteSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.PADS_FRONT:
      case PartType.PADS_REAR:
        return (
          <PadsFields
            data={specifications as Partial<PadsSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.DISC_FRONT:
      case PartType.DISC_REAR:
        return (
          <DiscFields
            data={specifications as Partial<DiscSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.BRAKE_CALIPER_FRONT:
      case PartType.BRAKE_CALIPER_REAR:
        return (
          <BrakeCaliperFields
            data={specifications as Partial<BrakeCaliperSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.FORK:
        return (
          <ForkFields
            data={specifications as Partial<ForkSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.SEATPOST:
        return (
          <SeatpostFields
            data={specifications as Partial<SeatpostSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.SPOKES:
        return (
          <SpokesFields
            data={specifications as Partial<SpokesSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.RIMS:
        return (
          <RimsFields
            data={specifications as Partial<RimsSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.HUBS:
        return (
          <HubsFields
            data={specifications as Partial<HubsSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.BOTTOM_BRACKET:
        return (
          <BottomBracketFields
            data={specifications as Partial<BottomBracketSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.CRANKSET:
        return (
          <CranksetFields
            data={specifications as Partial<CranksetSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.DERAILLEUR_REAR:
        return (
          <DerailleurRearFields
            data={specifications as Partial<DerailleurRearSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.SHIFTERS:
        return (
          <ShiftersFields
            data={specifications as Partial<ShiftersSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.PEDALS:
        return (
          <PedalsFields
            data={specifications as Partial<PedalsSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.STEM:
        return (
          <StemFields
            data={specifications as Partial<StemSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.HEADSET:
        return (
          <HeadsetFields
            data={specifications as Partial<HeadsetSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.HANDLEBAR:
        return (
          <HandlebarFields
            data={specifications as Partial<HandlebarSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.HANDLEBAR_TAPE:
        return (
          <HandlebarTapeFields
            data={specifications as Partial<HandlebarTapeSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.SUSPENSION_FORK:
      case PartType.DROPPER_POST:
      case PartType.SUSPENSION_SEATPOST:
        return (
          <div className="space-y-2">
            <Label>Skok (mm)</Label>
            <NumberStepper
              value={(specifications as Partial<SuspensionSpecificData>).travel || 0}
              onChange={(v) =>
                setSpecifications({ ...specifications, travel: v || undefined })
              }
              steps={[10]}
              min={0}
              placeholder="np. 100"
            />
          </div>
        );
      case PartType.TUBELESS_SEALANT_FRONT:
      case PartType.TUBELESS_SEALANT_REAR:
        return (
          <div className="space-y-2">
            <Label>Objętość (ml)</Label>
            <NumberStepper
              value={(specifications as Partial<TubelessSealantSpecificData>).volume || 0}
              onChange={(v) =>
                setSpecifications({ ...specifications, volume: v || undefined })
              }
              steps={[10]}
              min={0}
              placeholder="np. 60"
            />
          </div>
        );
      case PartType.INNER_TUBE_FRONT:
      case PartType.INNER_TUBE_REAR:
        return (
          <div className="space-y-2">
            <Label>Typ wentyla</Label>
            <Select
              value={(specifications as Partial<InnerTubeSpecificData>).valveType || "presta"}
              onValueChange={(v) =>
                setSpecifications({ ...specifications, valveType: v })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="presta">Presta</SelectItem>
                <SelectItem value="schrader">Schrader</SelectItem>
                <SelectItem value="dunlop">Dunlop</SelectItem>
              </SelectContent>
            </Select>
          </div>
        );
      case PartType.LUBRICANT:
        return (
          <LubricantFields
            data={specifications as Partial<LubricantSpecificData>}
            onChange={(data) => setSpecifications(data as Record<string, unknown>)}
          />
        );
      case PartType.MOTOR:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Moc (W)</Label>
              <NumberStepper
                value={(specifications as Partial<MotorSpecificData>).power || 0}
                onChange={(v) =>
                  setSpecifications({ ...specifications, power: v || undefined })
                }
                steps={[10, 50]}
                min={0}
                placeholder="np. 250"
              />
            </div>
            <div className="space-y-2">
              <Label>Typ silnika</Label>
              <Select
                value={(specifications as Partial<MotorSpecificData>).motorType || "mid-drive"}
                onValueChange={(v) =>
                  setSpecifications({ ...specifications, motorType: v })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mid-drive">Centralny</SelectItem>
                  <SelectItem value="hub-front">Piasta przednia</SelectItem>
                  <SelectItem value="hub-rear">Piasta tylna</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case PartType.BATTERY:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Pojemność (Wh)</Label>
              <NumberStepper
                value={(specifications as Partial<BatterySpecificData>).capacity || 0}
                onChange={(v) =>
                  setSpecifications({ ...specifications, capacity: v || undefined })
                }
                steps={[10, 100]}
                min={0}
                placeholder="np. 500"
              />
            </div>
            <div className="space-y-2">
              <Label>Napięcie (V)</Label>
              <NumberStepper
                value={(specifications as Partial<BatterySpecificData>).voltage || 0}
                onChange={(v) =>
                  setSpecifications({ ...specifications, voltage: v || undefined })
                }
                steps={[1]}
                min={0}
                placeholder="np. 36"
              />
            </div>
          </div>
        );
      default:
        return null;
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {initialData ? "Edytuj czesc" : "Nowa czesc"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="partType">Typ czesci</Label>
            <Select
              value={partType}
              onValueChange={(v) => handlePartTypeChange(v as PartType)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PartType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {PART_NAMES[type]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="brand">Marka</Label>
              <Input
                id="brand"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                required
                placeholder="np. Shimano"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <div className="flex gap-1">
                <Input
                  id="model"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  required
                  placeholder="np. CN-HG901"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(model);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                >
                  {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
          </div>

          {/* === Zdjęcie produktu === */}
          {initialData && (
            <div className="space-y-2">
              <Label>Zdjęcie produktu</Label>
              <ImageUploader
                images={officialImageUrl ? [officialImageUrl] : []}
                maxImages={1}
                entityType="product"
                entityId={initialData.id}
                onImagesChange={(urls) => setOfficialImageUrl(urls[0] || null)}
              />
            </div>
          )}

          {/* === Parametry szczegółowe === */}
          {hasSpecificFields(partType) && (
            <div className="space-y-2">
              <Label>Parametry szczegółowe</Label>
              <div className="space-y-4 rounded-md border p-4">
                {renderSpecificFields()}
              </div>
            </div>
          )}

          {/* === Statystyki === */}
          {initialData && (
            <div className="space-y-2">
              <Label>Statystyki</Label>
              <div className="grid grid-cols-2 gap-4 rounded-md border p-4">
                <div className="space-y-2">
                  <Label>Średnia ocena</Label>
                  <NumberStepper
                    value={averageRating ? parseFloat(averageRating) : 0}
                    onChange={(v) => setAverageRating(Math.round(v * 10) / 10 + "")}
                    steps={[0.1]}
                    min={0}
                    max={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Liczba opinii</Label>
                  <NumberStepper
                    value={totalReviews ? parseInt(totalReviews, 10) : 0}
                    onChange={(v) => setTotalReviews(v.toString())}
                    steps={[1]}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Średnia żywotność (km)</Label>
                  <NumberStepper
                    value={averageKmLifespan ? parseInt(averageKmLifespan, 10) : 0}
                    onChange={(v) => setAverageKmLifespan(v.toString())}
                    steps={[100, 1000]}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Liczba instalacji</Label>
                  <NumberStepper
                    value={totalInstallations ? parseInt(totalInstallations, 10) : 0}
                    onChange={(v) => setTotalInstallations(v.toString())}
                    steps={[1]}
                    min={0}
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Zapisywanie..." : "Zapisz"}
            </Button>
            {initialData && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={isPending}
              >
                Usun
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
