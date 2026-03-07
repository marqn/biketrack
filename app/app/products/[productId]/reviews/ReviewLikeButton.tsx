"use client";

import { useState, useTransition } from "react";
import { ThumbsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleReviewLike } from "@/app/app/actions/likes/toggle-review-like";
import { cn } from "@/lib/utils";

interface ReviewLikeButtonProps {
  reviewId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isAuthor: boolean;
}

export function ReviewLikeButton({
  reviewId,
  initialLikeCount,
  initialIsLiked,
  isAuthor,
}: ReviewLikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [liked, setLiked] = useState(initialIsLiked);
  const [count, setCount] = useState(initialLikeCount);

  const handleClick = () => {
    if (isAuthor || isPending) return;
    const prevLiked = liked;
    const prevCount = count;
    // Optimistic update
    setLiked(!prevLiked);
    setCount(prevLiked ? prevCount - 1 : prevCount + 1);
    startTransition(async () => {
      const result = await toggleReviewLike(reviewId);
      if (result.success) {
        setLiked(result.liked);
        setCount(result.likeCount);
      } else {
        setLiked(prevLiked);
        setCount(prevCount);
      }
    });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={isAuthor || isPending}
      className={cn(
        "h-7 px-2 text-xs gap-1",
        liked
          ? "text-blue-500 hover:text-blue-600"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={isAuthor ? "Nie możesz polubić własnej opinii" : undefined}
    >
      <ThumbsUp className={cn("h-3.5 w-3.5", liked && "fill-current")} />
      {count > 0 && <span>{count}</span>}
    </Button>
  );
}
