import { Progress } from "@/components/ui/progress";
import { Badge } from "./badge";

interface ColoredProgressProps {
  value: number;
  className?: string;
  showPercentage?: boolean;
}

export default function ColoredProgress({
  value,
  className = "",
  showPercentage = true,
}: ColoredProgressProps) {
  const colorClass =
    value >= 90
      ? "[&>div]:bg-red-500"
      : value >= 70
      ? "[&>div]:bg-yellow-500"
      : value >= 50
      ? "[&>div]:bg-blue-500"
      : "[&>div]:bg-green-500";

  return (
    <div className="relative">
      <Progress value={value} className={`${colorClass} ${className}`} />
      {showPercentage && (
        <span
          className="absolute inset-0 flex items-center justify-center text-xs font-bold z-10 pointer-events-none"
        >
          <Badge variant="secondary">{Math.round(value)}%</Badge>
        </span>
      )}
    </div>
  );
}
