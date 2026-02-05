"use client";

import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage, AvatarBadge } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Crown, ThumbsUp, ThumbsDown } from "lucide-react";
import { bikeTypeLabels } from "@/lib/types";
import { ReviewWithUser } from "@/app/app/actions/get-product-reviews";

interface ReviewCardProps {
  review: ReviewWithUser;
  isCurrentUser: boolean;
}

export function ReviewCard({ review, isCurrentUser }: ReviewCardProps) {
  const isPremium = review.user.plan === "PREMIUM" && review.user.planExpiresAt && new Date(review.user.planExpiresAt) > new Date();

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

  return (
    <Card className={isCurrentUser ? "border-primary/50" : ""}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className={`h-10 w-10 ${isPremium ? "ring-2 ring-blue-500" : ""}`}>
              <AvatarImage src={review.user.image || undefined} />
              <AvatarFallback>{initials}</AvatarFallback>
              {isPremium && (
                <AvatarBadge className="bg-blue-500 text-white ring-background">
                  <Crown className="size-2!" />
                </AvatarBadge>
              )}
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">
                  {review.user.name || "Uzytkownik"}
                </span>
                {isCurrentUser && (
                  <Badge variant="outline" className="text-xs">
                    Twoja opinia
                  </Badge>
                )}
                {review.verified && (
                  <Badge variant="secondary" className="text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Zweryfikowany
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                {formattedDate} · {bikeTypeLabels[review.bikeType]}
                {review.kmUsed > 0 &&
                  ` · ${review.kmUsed.toLocaleString("pl-PL")} km`}
              </div>
            </div>
          </div>

          {/* Star Rating Display */}
          <div className="flex gap-0.5 text-lg">
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
      </CardContent>
    </Card>
  );
}
