"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleBikeLike } from "@/app/app/actions/likes/toggle-bike-like";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  bikeId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
}

export function LikeButton({
  bikeId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
}: LikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(
    { liked: initialIsLiked, count: initialLikeCount },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  const handleClick = () => {
    if (!isLoggedIn) return;
    startTransition(async () => {
      addOptimistic(undefined as never);
      await toggleBikeLike(bikeId);
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!isLoggedIn || isPending}
      className={cn(
        "h-8 gap-1.5 px-3",
        optimistic.liked
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={!isLoggedIn ? "Zaloguj się, aby polubić" : undefined}
    >
      <Heart
        className={cn("h-4 w-4", optimistic.liked && "fill-current")}
      />
      <span className="text-sm">
        {optimistic.count > 0 ? optimistic.count : "Lubię to"}
      </span>
    </Button>
  );
}
