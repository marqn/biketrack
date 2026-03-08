"use client";

import { useOptimistic, useTransition, useState } from "react";
import { ThumbsUp } from "lucide-react";
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
  const [actual, setActual] = useState({ liked: initialIsLiked, count: initialLikeCount });
  const [optimistic, addOptimistic] = useOptimistic(
    actual,
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
      const result = await toggleCommentLike(commentId);
      if (result.success) {
        setActual({ liked: result.liked, count: result.likeCount });
      }
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
          ? "text-blue-500 hover:text-blue-600"
          : "text-muted-foreground hover:text-foreground"
      )}
      title={title}
    >
      <ThumbsUp className={cn("h-3 w-3", optimistic.liked && "fill-current")} />
      {optimistic.count > 0 && <span>{optimistic.count}</span>}
    </Button>
  );
}
