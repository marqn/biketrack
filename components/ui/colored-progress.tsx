import { Progress } from "@/components/ui/progress";

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
          style={{ 
            textShadow: '0 0 3px black, 0 0 3px black',
            color: 'white'
          }}
        >
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}