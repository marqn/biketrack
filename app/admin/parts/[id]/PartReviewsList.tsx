"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2, Star } from "lucide-react";
import { deletePartReview } from "../../_actions/part-products";
import { bikeTypeLabels } from "@/lib/types";

interface Review {
  id: string;
  rating: number;
  reviewText: string | null;
  kmAtReview: number;
  kmUsed: number;
  bikeType: string;
  pros: string[];
  cons: string[];
  verified: boolean;
  createdAt: Date | string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
}

interface PartReviewsListProps {
  reviews: Review[];
  productId: string;
}

export function PartReviewsList({ reviews, productId }: PartReviewsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Opinie ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-muted-foreground text-sm">Brak opinii</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ReviewItem({ review }: { review: Review }) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    startTransition(async () => {
      await deletePartReview(review.id);
      router.refresh();
    });
  }

  return (
    <div className="border rounded-md p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-muted-foreground"
                }`}
              />
            ))}
          </div>
          {review.verified && (
            <Badge variant="secondary" className="text-xs">Zweryfikowana</Badge>
          )}
          <Badge variant="outline" className="text-xs">
            {bikeTypeLabels[review.bikeType as keyof typeof bikeTypeLabels] || review.bikeType}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
          className="text-destructive hover:text-destructive"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground">
        <span>{review.user.name || review.user.email}</span>
        {" · "}
        <span>{new Date(review.createdAt).toLocaleDateString("pl-PL")}</span>
        {" · "}
        <span>{review.kmUsed} km użytkowania</span>
        {" · "}
        <span>przy {review.kmAtReview} km przebiegu</span>
      </div>

      {review.reviewText && (
        <p className="text-sm">{review.reviewText}</p>
      )}

      {(review.pros.length > 0 || review.cons.length > 0) && (
        <div className="flex gap-4 text-sm">
          {review.pros.length > 0 && (
            <div>
              <span className="text-green-600 font-medium">+</span>{" "}
              {review.pros.join(", ")}
            </div>
          )}
          {review.cons.length > 0 && (
            <div>
              <span className="text-red-600 font-medium">−</span>{" "}
              {review.cons.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
