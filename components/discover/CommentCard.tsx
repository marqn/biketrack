"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Flag, Lightbulb, HelpCircle, MessageSquare, Reply, Trash2 } from "lucide-react";
import { deleteComment } from "@/app/actions/comments/delete-comment";
import { CommentForm } from "./CommentForm";
import { ReportCommentDialog } from "./ReportCommentDialog";
import type { CommentData } from "./BikeCommentSection";

const TYPE_CONFIG = {
  GENERAL: { label: "Komentarz", icon: MessageSquare, variant: "secondary" as const },
  SUGGESTION: { label: "Sugestia", icon: Lightbulb, variant: "default" as const },
  QUESTION: { label: "Pytanie", icon: HelpCircle, variant: "outline" as const },
};

interface CommentCardProps {
  comment: CommentData;
  bikeId: string;
  currentUserId?: string;
  isLoggedIn: boolean;
  onCommentUpdated: () => void;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  bikeId,
  currentUserId,
  isLoggedIn,
  onCommentUpdated,
  isReply = false,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const isAuthor = currentUserId === comment.user.id;
  const config = TYPE_CONFIG[comment.type] || TYPE_CONFIG.GENERAL;
  const TypeIcon = config.icon;

  const initials = comment.user.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() ?? "?";

  const timeAgo = formatTimeAgo(comment.createdAt);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteComment(comment.id);
    if (result.success) {
      onCommentUpdated();
    }
    setIsDeleting(false);
  };

  return (
    <div className={`${isReply ? "ml-10 pl-4 border-l-2 border-muted" : ""}`}>
      <div className="flex gap-3">
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{comment.user.name ?? "Użytkownik"}</span>
            {!isReply && comment.type !== "GENERAL" && (
              <Badge variant={config.variant} className="text-xs gap-1">
                <TypeIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
          </div>

          <p className="text-sm mt-1 whitespace-pre-wrap break-words">{comment.content}</p>

          {/* Akcje */}
          <div className="flex items-center gap-1 mt-2">
            {isLoggedIn && !isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReplyForm(!showReplyForm)}
              >
                <Reply className="h-3 w-3 mr-1" />
                Odpowiedz
              </Button>
            )}
            {isLoggedIn && !isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground"
                onClick={() => setShowReportDialog(true)}
              >
                <Flag className="h-3 w-3 mr-1" />
                Zgłoś
              </Button>
            )}
            {isAuthor && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3 w-3 mr-1" />
                {isDeleting ? "Usuwanie..." : "Usuń"}
              </Button>
            )}
          </div>

          {/* Formularz odpowiedzi */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                bikeId={bikeId}
                parentId={comment.id}
                compact
                onCommentAdded={() => {
                  setShowReplyForm(false);
                  onCommentUpdated();
                }}
                onCancel={() => setShowReplyForm(false)}
              />
            </div>
          )}

          {/* Odpowiedzi */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3 space-y-3">
              {comment.replies.map((reply) => (
                <CommentCard
                  key={reply.id}
                  comment={{ ...reply, replies: [], _count: { reports: 0 } }}
                  bikeId={bikeId}
                  currentUserId={currentUserId}
                  isLoggedIn={isLoggedIn}
                  onCommentUpdated={onCommentUpdated}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Dialog zgłoszenia */}
      <ReportCommentDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        commentId={comment.id}
      />
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "teraz";
  if (diffMin < 60) return `${diffMin} min temu`;
  if (diffHours < 24) return `${diffHours} godz. temu`;
  if (diffDays < 7) return `${diffDays} dni temu`;

  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: diffDays > 365 ? "numeric" : undefined,
  });
}
