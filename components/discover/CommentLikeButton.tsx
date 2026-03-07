"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toggleCommentLike } from "@/app/app/actions/likes/toggle-comment-like";
import { cn } from "@/lib/utils";

interface CommentLikeButtonProps {
  commentId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
  isLoggedIn: boolean;
  isAuthor: boolean;
}

export function CommentLikeButton({
  commentId,
  initialLikeCount,
  initialIsLiked,
  isLoggedIn,
  isAuthor,
}: CommentLikeButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [optimistic, addOptimistic] = useOptimistic(
    { liked: initialIsLiked, count: initialLikeCount },
    (state) => ({
      liked: !state.liked,
      count: state.liked ? state.count - 1 : state.count + 1,
    })
  );

  const canLike = isLoggedIn && !isAuthor;

  const handleClick = () => {
    if (!canLike) return;
    startTransition(async () => {
      addOptimistic(undefined as never);
      await toggleCommentLike(commentId);
    });
  };

  const title = !isLoggedIn
    ? "Zaloguj się, aby polubić"
    : isAuthor
    ? "Nie możesz polubić własnego komentarza"
    : undefined;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={!canLike || isPending}
      className={cn(
        "h-7 px-2 text-xs gap-1",
        optimistic.liked
          ? "text-red-500 hover:text-red-600"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={title}
    >
      <Heart className={cn("h-3 w-3", optimistic.liked && "fill-current")} />
      {optimistic.count > 0 && <span>{optimistic.count}</span>}
    </Button>
  );
}
