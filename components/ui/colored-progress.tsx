import { Progress } from "@/components/ui/progress";

interface ColoredProgressProps {
  value: number;
  className?: string;
}

export default function ColoredProgress({
  value,
  className = "",
}: ColoredProgressProps) {
  const colorClass =
    value >= 90
      ? "[&>div]:bg-red-500"
      : value >= 70
      ? "[&>div]:bg-yellow-500"
      : "";

  return <Progress value={value} className={`${colorClass} ${className}`} />;
}
