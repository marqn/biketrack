"use client";

import { useState, useEffect, useOptimistic, useTransition } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { CommentCard } from "./CommentCard";
import { getComments } from "@/app/app/actions/comments/get-comments";
import { addComment } from "@/app/app/actions/comments/add-comment";

interface BikeCommentSectionProps {
  bikeId: string;
  isLoggedIn: boolean;
  currentUserId?: string;
  commentCount: number;
}

export type CommentData = {
  id: string;
  content: string;
  type: "GENERAL" | "SUGGESTION" | "QUESTION";
  createdAt: string;
  isOptimistic?: boolean;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  replies: Array<{
    id: string;
    content: string;
    type: "GENERAL" | "SUGGESTION" | "QUESTION";
    createdAt: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
  }>;
  _count: { reports: number };
};

export function BikeCommentSection({
  bikeId,
  isLoggedIn,
  currentUserId,
  commentCount: initialCount,
}: BikeCommentSectionProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<CommentData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(initialCount);

  const [isPending, startTransition] = useTransition();
  const [optimisticComments, dispatchOptimistic] = useOptimistic(
    comments,
    (
      state,
      action:
        | { type: "add"; comment: CommentData }
        | { type: "remove"; id: string }
    ) => {
      if (action.type === "add") return [action.comment, ...state];
      if (action.type === "remove") return state.filter((c) => c.id !== action.id);
      return state;
    }
  );

  const loadComments = async (pageNum: number) => {
    setIsLoading(true);
    try {
      const result = await getComments({ bikeId, page: pageNum, pageSize: 10 });
      if (result.success && result.comments) {
        if (pageNum === 1) {
          setComments(result.comments);
        } else {
          setComments((prev) => [...prev, ...result.comments!]);
        }
        setHasMore(pageNum < (result.totalPages ?? 1));
        setTotalComments(result.totalCount ?? initialCount);
      }
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [bikeId]);

  // Optimistic submit dla głównych komentarzy
  const handleSubmitComment = (
    content: string,
    type: "GENERAL" | "SUGGESTION" | "QUESTION"
  ): Promise<{ success: boolean; error?: string }> => {
    return new Promise((resolve) => {
      startTransition(async () => {
        const tempComment: CommentData = {
          id: `opt-${Date.now()}`,
          content,
          type,
          createdAt: new Date().toISOString(),
          isOptimistic: true,
          user: {
            id: currentUserId ?? "",
            name: session?.user?.name ?? "Ty",
            image: session?.user?.image ?? null,
          },
          replies: [],
          _count: { reports: 0 },
        };

        dispatchOptimistic({ type: "add", comment: tempComment });

        const result = await addComment({ bikeId, content, type });

        if (result.success) {
          setTotalComments((prev) => prev + 1);
          // Reload żeby zastąpić optimistic real danymi
          const reloaded = await getComments({ bikeId, page: 1, pageSize: 10 });
          if (reloaded.success && reloaded.comments) {
            setComments(reloaded.comments);
            setPage(1);
            setHasMore(1 < (reloaded.totalPages ?? 1));
            setTotalComments(reloaded.totalCount ?? totalComments + 1);
          }
        }

        resolve(result);
      });
    });
  };

  // Po dodaniu odpowiedzi — przeładuj
  const handleReplyAdded = () => {
    setPage(1);
    loadComments(1);
  };

  // Po usunięciu komentarza — przeładuj
  const handleCommentUpdated = () => {
    setPage(1);
    loadComments(1);
    setTotalComments((prev) => Math.max(0, prev - 1));
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    loadComments(nextPage);
  };

  return (
    <div className="bg-card rounded-xl border p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-lg font-semibold">
          Komentarze {totalComments > 0 && `(${totalComments})`}
        </h2>
      </div>

      {/* Formularz dodawania komentarza */}
      {isLoggedIn ? (
        <CommentForm
          onSubmit={handleSubmitComment}
          onCommentAdded={() => {}}
        />
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg mb-4">
          <a href="/login" className="text-primary hover:underline">
            Zaloguj się
          </a>
          , aby dodać komentarz
        </div>
      )}

      {/* Lista komentarzy (optimistic) */}
      <div className="space-y-4 mt-4">
        {optimisticComments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            bikeId={bikeId}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            onCommentUpdated={comment.isOptimistic ? () => {} : handleCommentUpdated}
            onReplyAdded={handleReplyAdded}
          />
        ))}
      </div>

      {optimisticComments.length === 0 && !isLoading && !isPending && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Brak komentarzy. Bądź pierwszy - dodaj komentarz!
        </p>
      )}

      {hasMore && comments.length > 0 && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
            {isLoading ? "Ładowanie..." : "Pokaż więcej"}
          </Button>
        </div>
      )}
    </div>
  );
}
