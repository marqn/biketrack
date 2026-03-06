"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import NumberStepper from "@/components/ui/number-stepper";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { setLastLubeKm } from "@/app/app/actions/lube-service";
import { displayKm, inputToKm, distanceUnit, type UnitPreference } from "@/lib/units";

interface LubeKmEditorProps {
  bikeId: string;
  currentKm: number;
  lastLubeKm?: number | null;
  lastEventId?: string | null;
}

function EditorContent({
  bikeId,
  currentKm,
  lastLubeKm,
  lastEventId,
  onClose,
}: LubeKmEditorProps & { onClose: () => void }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";

  const kmSinceLast = lastLubeKm !== null && lastLubeKm !== undefined
    ? currentKm - lastLubeKm
    : 0;

  const [value, setValue] = useState(displayKm(kmSinceLast, unitPref));
  const unit = distanceUnit(unitPref);
  const maxDisplay = displayKm(currentKm, unitPref);

  function handleSave() {
    const kmSinceInKm = inputToKm(value, unitPref);
    const kmAtLube = currentKm - kmSinceInKm;
    startTransition(async () => {
      await setLastLubeKm(bikeId, kmAtLube, lastEventId);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="text-sm text-muted-foreground">
        Podaj ile {unit} temu ostatnio smarowałeś łańcuch.
      </p>
      <NumberStepper
        value={value}
        onChange={setValue}
        steps={[1, 10]}
        min={0}
        max={maxDisplay}
        disabled={isPending}
        className="w-full"
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
      />
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
          Anuluj
        </Button>
        <Button size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </div>
    </div>
  );
}

export default function LubeKmEditor(props: LubeKmEditorProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const trigger = (
    <button
      type="button"
      className="flex items-center gap-2 min-w-0 hover:opacity-70 transition-opacity cursor-pointer"
      onClick={() => setOpen(true)}
    >
      <Droplets className="h-4 w-4 text-muted-foreground shrink-0" />
      <span className="text-sm font-medium">Smarowanie łańcucha</span>
    </button>
  );

  if (isMobile) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Ostatnie smarowanie</DrawerTitle>
            </DrawerHeader>
            <EditorContent {...props} onClose={() => setOpen(false)} />
            <DrawerFooter>
              <DrawerClose asChild>
                <Button variant="outline">Zamknij</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <p className="font-medium text-sm mb-1">Ostatnie smarowanie</p>
        <EditorContent {...props} onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
