"use client";
import React, { useState, useEffect, JSX } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Calendar,
  Bike,
  ChevronDown,
  Package,
  Pencil,
  Trash2,
} from "lucide-react";
import EditLubeDialog from "@/components/part-card/EditLubeDialog";
import EditReplacementDialog from "@/components/part-card/EditReplacementDialog";
import { ConfirmDeleteDialog } from "@/components/bike-header/dialogs";
import {
  deleteLubeEvent,
  updateLubeEvent,
} from "@/app/app/actions/lube-service";
import {
  deletePartReplacement,
  updatePartReplacement,
} from "@/app/app/actions/replace-part";
import { useRouter } from "next/navigation";
import { PartType } from "@/lib/generated/prisma";
import { PartReplacement } from "@/lib/types";
import { getPartName } from "@/lib/default-parts";
import { formatDate } from "@/lib/utils";
import { getCategoryIcon, SERVICE_ICON } from "@/lib/part-icons";

interface ServiceEvent {
  id: string;
  type: string;
  kmAtTime: number;
  lubricantBrand: string | null;
  notes: string | null;
  createdAt: string;
}

interface TimelineItem {
  id: string;
  type: "replacement" | "service";
  data: PartReplacement | ServiceEvent;
  createdAt: string;
}

interface BikeInfo {
  id: string;
  name: string | null;
  brand: string | null;
  model: string | null;
  totalKm: number;
}

type FilterType = "all" | "replacement" | "service";

const BikePartsHistory: React.FC = () => {
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [bike, setBike] = useState<BikeInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<
    "replacement" | "service" | null
  >(null);
  const [editItem, setEditItem] = useState<TimelineItem | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/parts/replacements");

      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych");
      }

      const data = await response.json();
      setTimeline(data.timeline || []);
      setBike(data.bike || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: TimelineItem) => {
    setEditItem(item);
  };

  const handleDelete = (item: TimelineItem) => {
    setDeleteId(item.id);
    setDeleteType(item.type);
  };

  const confirmDelete = async () => {
    if (!deleteId || !deleteType) return;

    try {
      if (deleteType === "replacement") {
        await deletePartReplacement(deleteId);
      } else {
        await deleteLubeEvent(deleteId);
      }

      router.refresh();
      await fetchData();
    } catch (err) {
      console.error("Error deleting:", err);
      alert(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setDeleteId(null);
      setDeleteType(null);
    }
  };

  const handleEditReplacement = async (data: {
    brand?: string;
    model?: string;
    notes?: string;
  }) => {
    if (!editItem || editItem.type !== "replacement") return;

    try {
      await updatePartReplacement(editItem.id, data);
      router.refresh();
      await fetchData();
      setEditItem(null);
    } catch (err) {
      console.error("Error updating:", err);
      alert(err instanceof Error ? err.message : "Wystąpił błąd");
    }
  };

  const handleEditService = async (data: {
    lubricantBrand?: string;
    notes?: string;
  }) => {
    if (!editItem || editItem.type !== "service") return;

    try {
      await updateLubeEvent(editItem.id, data);
      router.refresh();
      await fetchData();
      setEditItem(null);
    } catch (err) {
      console.error("Error updating:", err);
      alert(err instanceof Error ? err.message : "Wystąpił błąd");
    }
  };

  const replacementsCount = timeline.filter(
    (item) => item.type === "replacement",
  ).length;
  const servicesCount = timeline.filter(
    (item) => item.type === "service",
  ).length;

  const filteredTimeline = timeline.filter((item) => {
    if (filter === "all") return true;
    return item.type === filter;
  });

  const renderTimelineItem = (item: TimelineItem) => {
    if (item.type === "service") {
      const service = item.data as ServiceEvent;
      return (
        <div key={item.id} className="relative pl-20">
          {/* Timeline icon with km */}
          <div className="absolute left-0 top-6 flex flex-col items-center">
            <div className="p-2.5 bg-cyan-600 rounded-full shadow-md">
              {getCategoryIcon("service")}
            </div>
            <span className="text-xs font-semibold text-cyan-600 mt-1">
              <Badge className="bg-cyan-600">
                {service.kmAtTime.toLocaleString("pl-PL")} km
              </Badge>
            </span>
          </div>

          <Card className="hover:shadow-lg transition-shadow duration-300 border-l-4 border-l-cyan-500">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl mb-1">
                    Smarowanie łańcucha
                  </CardTitle>
                  <CardDescription className="text-base">
                    {service.lubricantBrand || "Serwis"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => handleEdit(item)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(item)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 ">
                  <Calendar className="w-4 h-4 " />
                  <span className="text-sm font-medium">Data serwisu:</span>
                  <span className="text-sm">
                    {formatDate(service.createdAt)}
                  </span>
                </div>
                {service.lubricantBrand && (
                  <div className="flex items-center gap-2 ">
                    <SERVICE_ICON />
                    <span className="text-sm font-medium">Środek:</span>
                    <span className="text-sm">{service.lubricantBrand}</span>
                  </div>
                )}
                {service.notes && (
                  <div className="flex items-start gap-2  md:col-span-2">
                    <Package className="w-4 h-4  mt-0.5" />
                    <div>
                      <span className="text-sm font-medium">Notatki: </span>
                      <span className="text-sm">{service.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    // Wymiana części
    const part = item.data as PartReplacement;
    return (
      <div key={item.id} className="relative pl-20">
        {/* Timeline icon with km */}
        <div className="absolute left-0 top-6 flex flex-col items-center">
          <div className="p-2.5 bg-blue-600 rounded-full shadow-md ">
            {getCategoryIcon(part.partType || "")}
          </div>
          <span className="text-xs font-semibold text-blue-600 mt-1">
            <Badge className="bg-blue-600">
              {part.kmAtReplacement.toLocaleString("pl-PL")} km
            </Badge>
          </span>
        </div>

        <Card className="hover:shadow-lg transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-xl mb-1">
                  {part.brand && part.model
                    ? `${part.brand} ${part.model}`
                    : getPartName(part.partType)}
                </CardTitle>
                <CardDescription className="text-base">
                  {getPartName(part.partType)}
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleEdit(item)}
                >
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(item)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 ">
                <Calendar className="w-4 h-4 " />
                <span className="text-sm font-medium">Data wymiany:</span>
                <span className="text-sm">{formatDate(part.createdAt)}</span>
              </div>
              <div className="flex items-center gap-2 ">
                <Wrench className="w-4 h-4 " />
                <span className="text-sm font-medium">Zużycie części:</span>
                <span className="text-sm font-semibold text-orange-600">
                  {part.kmUsed.toLocaleString("pl-PL")} km
                </span>
              </div>
              {part.notes && (
                <div className="flex items-start gap-2  md:col-span-2">
                  <Package className="w-4 h-4  mt-0.5" />
                  <div>
                    <span className="text-sm font-medium">Notatki: </span>
                    <span className="text-sm">{part.notes}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="">Ładowanie historii...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Błąd</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br  p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full mb-4">
            <Bike className="w-10 h-10 " />
          </div>
          <h1 className="text-4xl font-bold  mb-2">Historia Serwisu</h1>
          {bike && (
            <p className=" text-lg">
              {bike.brand && bike.model
                ? `${bike.brand} ${bike.model}`
                : bike.name || "Twój rower"}
            </p>
          )}

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            <div className=" rounded-lg px-6 py-4 shadow-sm">
              <div className="text-2xl font-bold text-blue-600">
                {replacementsCount}
              </div>
              <div className="text-sm ">Wymian</div>
            </div>
            <div className=" rounded-lg px-6 py-4 shadow-sm">
              <div className="text-2xl font-bold text-cyan-600">
                {servicesCount}
              </div>
              <div className="text-sm ">Smarowań</div>
            </div>
            {bike && (
              <div className=" rounded-lg px-6 py-4 shadow-sm">
                <div className="text-2xl font-bold text-green-600">
                  {bike.totalKm.toLocaleString("pl-PL")} km
                </div>
                <div className="text-sm ">Łączny przebieg</div>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Button
              variant={filter === "all" ? "default" : "outline"}
              onClick={() => setFilter("all")}
              size="sm"
            >
              Wszystko ({timeline.length})
            </Button>
            <Button
              variant={filter === "replacement" ? "default" : "outline"}
              onClick={() => setFilter("replacement")}
              size="sm"
              className={
                filter === "replacement"
                  ? ""
                  : "border-blue-600 text-blue-600 hover:bg-blue-500"
              }
            >
              <Wrench className="w-4 h-4 mr-2" />
              Wymiany ({replacementsCount})
            </Button>
            <Button
              variant={filter === "service" ? "default" : "outline"}
              onClick={() => setFilter("service")}
              size="sm"
              className={
                filter === "service"
                  ? "bg-cyan-600 hover:bg-cyan-700"
                  : "border-cyan-600 text-cyan-600 hover:bg-cyan-500"
              }
            >
              <SERVICE_ICON />
              Smarowania ({servicesCount})
            </Button>
          </div>
        </div>

        {/* Timeline */}
        {filteredTimeline.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className=" text-lg">
                Brak{" "}
                {filter === "replacement"
                  ? "wymian"
                  : filter === "service"
                    ? "smarowań"
                    : "historii"}
              </p>
              <p className=" text-sm mt-2">
                {filter === "all"
                  ? "Wymiany części i serwisy będą tutaj wyświetlane"
                  : "Zmień filtr, aby zobaczyć inne zdarzenia"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-200"></div>

            {/* Timeline items */}
            <div className="space-y-8">
              {filteredTimeline.map((item) => renderTimelineItem(item))}
            </div>

            {/* End indicator */}
            <div className="relative pl-20 mt-8">
              <div className="absolute left-6 top-0 w-5 h-5 bg-slate-300 rounded-full border-4 border-white"></div>
              <div className="text-center py-8 ">
                <ChevronDown className="w-6 h-6 mx-auto mb-2" />
                <p className="text-sm">Początek historii serwisowej</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        open={!!deleteId}
        deleteId={deleteId}
        deleteType={deleteType}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setDeleteId(null);
            setDeleteType(null);
          }
        }}
        onConfirm={confirmDelete}
        itemName={deleteType === "service" ? "smarowania" : "wymian"}
      />

      {/* Edit Dialogs */}
      {editItem && editItem.type === "replacement" && (
        <EditReplacementDialog
          open={true}
          onOpenChange={() => setEditItem(null)}
          replacement={editItem.data as PartReplacement}
          onSave={handleEditReplacement}
        />
      )}

      {editItem && editItem.type === "service" && (
        <EditLubeDialog
          open={true}
          onOpenChange={() => setEditItem(null)}
          lubeEvent={editItem.data as ServiceEvent}
          onSave={handleEditService}
        />
      )}
    </div>
  );
};

export default BikePartsHistory;
