import { Star } from "lucide-react";

interface RecentReviewsProps {
  reviews: any[];
}

export const RecentReviews = ({ reviews }: RecentReviewsProps) => {
  if (reviews.length === 0) return null;

  return (
    <div className="dossier-card p-8 space-y-6">
      <h3 className="font-display text-lg font-bold tracking-tight">Recent Reviews</h3>
      <div className="space-y-4">
        {reviews.map((review, i) => (
          <div key={i} className="border-b border-border/20 last:border-0 pb-4 last:pb-0 space-y-2">
            <div className="flex items-center gap-1">
              {[...Array(review.rating)].map((_, j) => (
                <Star key={j} className="h-3.5 w-3.5 fill-warning text-warning" />
              ))}
              {[...Array(5 - review.rating)].map((_, j) => (
                <Star key={j} className="h-3.5 w-3.5 text-border" />
              ))}
            </div>
            {review.review_text && (
              <p className="text-sm text-muted-foreground italic line-clamp-2">"{review.review_text}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
