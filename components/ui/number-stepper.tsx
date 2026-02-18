"use client";

import { useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  /** Which step buttons to show, e.g. [1, 10] or [1, 10, 100]. Default: [1, 10] */
  steps?: number[];
  min?: number;
  max?: number;
  disabled?: boolean;
  /** When true, the value cannot go below its initial value (set on first render) */
  incrementOnly?: boolean;
  name?: string;
  placeholder?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
}

export default function NumberStepper({
  value,
  onChange,
  steps = [1, 10],
  min = 0,
  max,
  disabled = false,
  incrementOnly = false,
  name,
  placeholder,
  onKeyDown,
  className,
}: NumberStepperProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const valueRef = useRef(value);
  const initialValueRef = useRef(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  const effectiveMin = incrementOnly ? Math.max(min, initialValueRef.current) : min;
  const clamp = useCallback(
    (v: number) => Math.min(max ?? Infinity, Math.max(effectiveMin, v)),
    [effectiveMin, max]
  );

  const startHold = useCallback(
    (amount: number) => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);

      const next = clamp(valueRef.current + amount);
      valueRef.current = next;
      onChange(next);

      timeoutRef.current = setTimeout(() => {
        intervalRef.current = setInterval(() => {
          const next = clamp(valueRef.current + amount);
          valueRef.current = next;
          onChange(next);
        }, 50);
      }, 300);
    },
    [onChange, clamp]
  );

  const stopHold = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const sorted = [...steps].sort((a, b) => a - b);

  const holdProps = (amount: number) => ({
    onMouseDown: () => startHold(amount),
    onMouseUp: stopHold,
    onMouseLeave: stopHold,
    onTouchStart: () => startHold(amount),
    onTouchEnd: stopHold,
  });

  const stepLabel = (step: number, positive: boolean) => {
    const sign = positive ? "+" : "−";
    if (step === 1) return <span className="text-lg">{sign}</span>;
    return <span className="text-xs font-semibold">{sign}{step}</span>;
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {/* Decrement buttons: largest step first */}
      {[...sorted].reverse().map((step) => (
        <Button
          key={`dec-${step}`}
          type="button"
          variant="outline"
          size="icon"
          {...holdProps(-step)}
          disabled={disabled || value <= effectiveMin}
          className="shrink-0"
          title={`-${step}`}
        >
          {stepLabel(step, false)}
        </Button>
      ))}

      <Input
        name={name}
        type="number"
        value={value}
        onChange={(e) => onChange(clamp(Number(e.target.value)))}
        onFocus={(e) => e.target.select()}
        onKeyDown={onKeyDown}
        disabled={disabled}
        placeholder={placeholder}
        min={effectiveMin}
        className="flex-1 text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
      />

      {/* Increment buttons: smallest step first */}
      {sorted.map((step) => (
        <Button
          key={`inc-${step}`}
          type="button"
          variant="outline"
          size="icon"
          {...holdProps(step)}
          disabled={disabled || (max != null && value >= max)}
          className="shrink-0"
          title={`+${step}`}
        >
          {stepLabel(step, true)}
        </Button>
      ))}
    </div>
  );
}
