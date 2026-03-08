"use client";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Flag, Lightbulb, HelpCircle, MessageSquare, Reply, Trash2, Pencil } from "lucide-react";
import { deleteComment } from "@/app/app/actions/comments/delete-comment";
import { editComment } from "@/app/app/actions/comments/edit-comment";
import { CommentForm } from "./CommentForm";
import { ReportCommentDialog } from "./ReportCommentDialog";
import { CommentLikeButton } from "./CommentLikeButton";
import { getReputationTier } from "./ReputationBadge";
import type { CommentData } from "./BikeCommentSection";

const TYPE_CONFIG = {
  GENERAL: { label: "Komentarz", icon: MessageSquare, variant: "secondary" as const },
  SUGGESTION: { label: "Sugestia", icon: Lightbulb, variant: "default" as const },
  QUESTION: { label: "Pytanie", icon: HelpCircle, variant: "outline" as const },
};

const COMMENT_TYPES = [
  { value: "GENERAL", label: "Komentarz", icon: MessageSquare },
  { value: "SUGGESTION", label: "Sugestia", icon: Lightbulb },
  { value: "QUESTION", label: "Pytanie", icon: HelpCircle },
] as const;

interface CommentCardProps {
  comment: CommentData;
  bikeId: string;
  currentUserId?: string;
  isLoggedIn: boolean;
  onCommentUpdated: () => void;
  onReplyAdded?: () => void;
  isReply?: boolean;
}

export function CommentCard({
  comment,
  bikeId,
  currentUserId,
  isLoggedIn,
  onCommentUpdated,
  onReplyAdded,
  isReply = false,
}: CommentCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [editType, setEditType] = useState<"GENERAL" | "SUGGESTION" | "QUESTION">(comment.type);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const isAuthor = currentUserId === comment.user.id;
  const config = TYPE_CONFIG[comment.type] || TYPE_CONFIG.GENERAL;
  const TypeIcon = config.icon;
  const reputationTier = getReputationTier(comment.user.reputation ?? 0);

  const initials =
    comment.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "?";

  const timeAgo = formatTimeAgo(comment.createdAt);
  const wasEdited =
    new Date(comment.updatedAt).getTime() - new Date(comment.createdAt).getTime() > 5000;

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteComment(comment.id);
    if (result.success) {
      onCommentUpdated();
    }
    setIsDeleting(false);
  };

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    (onReplyAdded ?? onCommentUpdated)();
  };

  const handleEditOpen = () => {
    setEditContent(comment.content);
    setEditType(comment.type);
    setEditError(null);
    setShowEditForm(true);
  };

  const handleEditSave = async () => {
    if (!editContent.trim()) return;
    setIsSaving(true);
    setEditError(null);
    const result = await editComment({
      commentId: comment.id,
      content: editContent.trim(),
      type: isReply ? undefined : editType,
    });
    setIsSaving(false);
    if (result.success) {
      setShowEditForm(false);
      onCommentUpdated();
    } else {
      setEditError(result.error ?? "Wystąpił błąd");
    }
  };

  return (
    <div
      className={`${isReply ? "ml-10 pl-4 border-l-2 border-muted" : ""} ${
        comment.isOptimistic ? "opacity-60" : ""
      }`}
    >
      <div className="flex gap-3">
        <Avatar className={`h-8 w-8 shrink-0 ${reputationTier.borderClass}`}>
          <AvatarImage src={comment.user.image ?? undefined} />
          <AvatarFallback className="text-xs">{initials}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${reputationTier.className ? `rounded px-1.5 py-0.5 ${reputationTier.className}` : ""}`}>
              {comment.user.name ?? "Użytkownik"}
            </span>
            {!isReply && comment.type !== "GENERAL" && (
              <Badge variant={config.variant} className="text-xs gap-1">
                <TypeIcon className="h-3 w-3" />
                {config.label}
              </Badge>
            )}
            <span className="text-xs text-muted-foreground">{timeAgo}</span>
            {wasEdited && (
              <span className="text-xs text-muted-foreground italic">(edytowano)</span>
            )}
            {comment.isOptimistic && (
              <span className="text-xs text-muted-foreground italic">wysyłanie...</span>
            )}
          </div>

          {/* Formularz edycji inline */}
          {showEditForm ? (
            <div className="mt-2 space-y-2">
              {!isReply && (
                <div className="flex gap-2">
                  {COMMENT_TYPES.map((t) => {
                    const Icon = t.icon;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setEditType(t.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          editType === t.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        <Icon className="h-3 w-3" />
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              )}
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                maxLength={2000}
                disabled={isSaving}
                autoFocus
              />
              {editError && <p className="text-sm text-destructive">{editError}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{editContent.length}/2000</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEditForm(false)}
                    disabled={isSaving}
                  >
                    Anuluj
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleEditSave}
                    disabled={!editContent.trim() || isSaving}
                  >
                    {isSaving ? "Zapisywanie..." : "Zapisz"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm mt-1 whitespace-pre-wrap wrap-break-word">{comment.content}</p>
          )}

          {/* Akcje — ukryte dla optimistic i podczas edycji */}
          {!comment.isOptimistic && !showEditForm && (
            <div className="flex items-center gap-1 mt-2">
              <CommentLikeButton
                commentId={comment.id}
                initialLikeCount={comment.likeCount}
                initialIsLiked={comment.isLikedByCurrentUser}
                isLoggedIn={isLoggedIn}
                isAuthor={isAuthor}
              />
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
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs text-muted-foreground"
                    onClick={handleEditOpen}
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edytuj
                  </Button>
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
                </>
              )}
            </div>
          )}

          {/* Formularz odpowiedzi */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                bikeId={bikeId}
                parentId={comment.id}
                compact
                onCommentAdded={handleReplyAdded}
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
                  comment={{ ...reply, replies: [], _count: { reports: 0 }, likeCount: reply.likeCount, isLikedByCurrentUser: reply.isLikedByCurrentUser }}
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
