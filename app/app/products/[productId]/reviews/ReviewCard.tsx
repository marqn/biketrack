"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CheckCircle, Crown, ThumbsUp, ThumbsDown, Pencil, Trash2, Flag } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";
import { ReviewWithUser } from "@/app/app/actions/get-product-reviews";
import { useSession } from "next-auth/react";
import { formatDistance } from "@/lib/units";
import type { UnitPreference } from "@/lib/units";
import { ReviewLikeButton } from "./ReviewLikeButton";
import { getReputationTier } from "@/components/discover/ReputationBadge";
import { deleteProductReview } from "@/app/app/actions/delete-product-review";
import { ReportReviewDialog } from "./ReportReviewDialog";
import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";

interface ReviewCardProps {
  review: ReviewWithUser;
  isCurrentUser: boolean;
  onEdit?: () => void;
}

export function ReviewCard({ review, isCurrentUser, onEdit }: ReviewCardProps) {
  const { data: session } = useSession();
  const unitPref: UnitPreference = session?.user?.unitPreference ?? "METRIC";
  const isPremium = review.user.plan === "PREMIUM" && review.user.planExpiresAt && new Date(review.user.planExpiresAt) > new Date();
  const reputationTier = getReputationTier(review.user.reputation ?? 0);
  const avatarRingClass = reputationTier.borderClass || (isPremium ? "ring-2 ring-blue-500" : "");
  const [isPending, startTransition] = useTransition();
  const [showReportDialog, setShowReportDialog] = useState(false);
  const router = useRouter();

  const initials =
    review.user.name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

  const formattedDate = new Date(review.createdAt).toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  function handleDelete() {
    startTransition(async () => {
      await deleteProductReview(review.id);
      router.refresh();
    });
  }

  return (
    <Card className={isCurrentUser ? "border-primary/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className={`h-10 w-10 shrink-0 ${avatarRingClass}`}>
              <AvatarImage src={review.user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
              {isPremium && (
                <AvatarBadge className="bg-blue-500 text-white ring-background">
                  <Crown className="size-2!" />
                </AvatarBadge>
              )}
            </Avatar>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`font-medium ${reputationTier.className ? `rounded px-1.5 py-0.5 ${reputationTier.className}` : ""}`}>
                  {review.user.name || "Użytkownik"}
                </span>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    Twoja opinia
                  </Badge>
                )}
                {review.verified && (
                  <>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge variant="secondary" className="text-xs cursor-default hidden md:inline-flex">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Zweryfikowany
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        Użytkownik faktycznie używał tego produktu — recenzja pochodzi z zainstalowanej części lub zdarzenia serwisowego.
                      </TooltipContent>
                    </Tooltip>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Badge variant="secondary" className="text-xs cursor-pointer md:hidden">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Zweryfikowany
                        </Badge>
                      </PopoverTrigger>
                      <PopoverContent
                        className="text-xs max-w-64 px-3 py-2 border-0"
                        style={{ background: "oklch(0.62 0.24 264)", color: "oklch(0.98 0.01 264)" }}
                      >
                        Użytkownik faktycznie używał tego produktu — recenzja pochodzi z zainstalowanej części lub zdarzenia serwisowego.
                      </PopoverContent>
                    </Popover>
                  </>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formattedDate} · {bikeTypeLabels[review.bikeType]}
                {review.kmUsed > 0 &&
                  ` · ${formatDistance(review.kmUsed, unitPref)}`}
              </div>
            </div>
          </div>

          {/* Star Rating Display */}
          <div className="flex gap-0.5 text-lg shrink-0">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={
                  star <= review.rating
                    ? "text-yellow-500"
                    : "text-muted-foreground"
                }
              >
                {star <= review.rating ? "★" : "☆"}
              </span>
            ))}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {review.reviewText && <p className="text-sm">{review.reviewText}</p>}

        {/* Pros */}
        {review.pros.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.pros.map((pro, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-green-600 border-green-200"
              >
                <ThumbsUp className="w-3 h-3 mr-1" />
                {pro}
              </Badge>
            ))}
          </div>
        )}

        {/* Cons */}
        {review.cons.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {review.cons.map((con, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-red-600 border-red-200"
              >
                <ThumbsDown className="w-3 h-3 mr-1" />
                {con}
              </Badge>
            ))}
          </div>
        )}

        {/* Akcje */}
        <div className="flex items-center justify-between pt-1">
          {isCurrentUser ? (
            <div className="flex items-center gap-1">
              {onEdit && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onEdit}
                  disabled={isPending}
                  className="h-8 px-2 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  Edytuj
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isPending}
                    className="h-8 px-2 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                    Usuń
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Usunąć opinię?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tej operacji nie można cofnąć. Opinia zostanie trwale usunięta.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Usuń
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowReportDialog(true)}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <Flag className="w-3.5 h-3.5 mr-1.5" />
              Zgłoś
            </Button>
          )}
          <ReviewLikeButton
            reviewId={review.id}
            initialLikeCount={review.likeCount}
            initialIsLiked={review.isLikedByCurrentUser}
            isAuthor={isCurrentUser}
          />
        </div>
      </CardContent>

      <ReportReviewDialog
        open={showReportDialog}
        onOpenChange={setShowReportDialog}
        reviewId={review.id}
      />
    </Card>
  );
}
