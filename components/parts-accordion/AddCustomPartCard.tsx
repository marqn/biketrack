"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import AddCustomPartDialog from "./AddCustomPartDialog";

interface AddCustomPartCardProps {
  bikeId: string;
  category: string;
}

export default function AddCustomPartCard({ bikeId, category }: AddCustomPartCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <>
      <Card
        className="flex flex-col items-center justify-center gap-2 p-6 cursor-pointer border-dashed hover:border-primary hover:bg-muted/50 transition-colors min-h-[120px]"
        onClick={() => setDialogOpen(true)}
      >
        <Plus className="h-8 w-8 text-muted-foreground" />
        <span className="text-sm text-muted-foreground text-center">
          Dodaj swoją część
        </span>
      </Card>

      <AddCustomPartDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        bikeId={bikeId}
        category={category}
      />
    </>
  );
}
