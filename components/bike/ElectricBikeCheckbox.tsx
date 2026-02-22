"use client";

import { ZapIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ElectricBikeCheckboxProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ElectricBikeCheckbox({
  id = "is-electric",
  checked,
  onCheckedChange,
  disabled,
}: ElectricBikeCheckboxProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onCheckedChange(value === true)}
        disabled={disabled}
        icon={<ZapIcon className="text-blue-500" />}
      />
      <Label htmlFor={id} className="cursor-pointer">
        e-bike
      </Label>
    </div>
  );
}
