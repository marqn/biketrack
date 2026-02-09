"use client";

import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DiscSpecificData } from "@/lib/part-specific-data";

interface DiscFieldsProps {
  data: Partial<DiscSpecificData>;
  onChange: (data: Partial<DiscSpecificData>) => void;
}

export default function DiscFields({ data, onChange }: DiscFieldsProps) {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Specyfikacja tarczy</h4>

      <div className="space-y-2">
        <Label htmlFor="disc-mount">Mocowanie tarczy</Label>
        <Select
          value={data.discMount || "centerlock"}
          onValueChange={(value) =>
            onChange({
              ...data,
              discMount: value as DiscSpecificData["discMount"],
            })
          }
        >
          <SelectTrigger id="disc-mount">
            <SelectValue placeholder="Wybierz mocowanie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="centerlock">Center Lock</SelectItem>
            <SelectItem value="6-bolt">6 śrub</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="disc-size">Rozmiar</Label>
        <Select
          value={data.size || "160"}
          onValueChange={(value) =>
            onChange({
              ...data,
              size: value as DiscSpecificData["size"],
            })
          }
        >
          <SelectTrigger id="disc-size">
            <SelectValue placeholder="Wybierz rozmiar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="140">140 mm</SelectItem>
            <SelectItem value="160">160 mm</SelectItem>
            <SelectItem value="180">180 mm</SelectItem>
            <SelectItem value="183">183 mm</SelectItem>
            <SelectItem value="200">200 mm</SelectItem>
            <SelectItem value="203">203 mm</SelectItem>
            <SelectItem value="220">220 mm</SelectItem>
            <SelectItem value="223">223 mm</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
