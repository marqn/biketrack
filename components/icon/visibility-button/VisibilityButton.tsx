import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

type VisibilityButtonProps = {
  isVisible: boolean;
  onClick: () => void;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export function VisibilityButton({
  isVisible,
  onClick,
  variant = "outline",
  size = "icon",
}: VisibilityButtonProps) {
  return (
    <Button variant={variant} size={size} onClick={onClick} >
      {isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
    </Button>
  );
}
