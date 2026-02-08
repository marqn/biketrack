"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { CommentForm } from "./CommentForm";
import { CommentCard } from "./CommentCard";
import { getComments } from "@/app/app/actions/comments/get-comments";

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
  const [comments, setComments] = useState<CommentData[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalComments, setTotalComments] = useState(initialCount);

  const loadComments = async (pageNum: number) => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments(1);
  }, [bikeId]);

  const handleCommentAdded = () => {
    setPage(1);
    loadComments(1);
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
        <CommentForm bikeId={bikeId} onCommentAdded={handleCommentAdded} />
      ) : (
        <div className="text-center py-4 text-sm text-muted-foreground border rounded-lg mb-4">
          <a href="/login" className="text-primary hover:underline">
            Zaloguj się
          </a>
          , aby dodać komentarz
        </div>
      )}

      {/* Lista komentarzy */}
      <div className="space-y-4 mt-4">
        {comments.map((comment) => (
          <CommentCard
            key={comment.id}
            comment={comment}
            bikeId={bikeId}
            currentUserId={currentUserId}
            isLoggedIn={isLoggedIn}
            onCommentUpdated={handleCommentAdded}
          />
        ))}
      </div>

      {comments.length === 0 && !loading && (
        <p className="text-center text-sm text-muted-foreground py-8">
          Brak komentarzy. Bądź pierwszy - dodaj komentarz!
        </p>
      )}

      {hasMore && comments.length > 0 && (
        <div className="text-center mt-4">
          <Button variant="outline" onClick={handleLoadMore} disabled={loading}>
            {loading ? "Ładowanie..." : "Pokaż więcej"}
          </Button>
        </div>
      )}
    </div>
  );
}
