import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import AddReviewModal from "../components/dashboard/AddReviewModal";
import EditReviewModal from "../components/dashboard/EditReviewModal";
import DeleteReviewModal from "../components/dashboard/DeleteReviewModal";
import { ListSkeleton } from "../components/dashboard/DashboardSkeleton";
import { fetchReviews } from "../lib/api";

function Stars({ rating }) {
  return (
    <span aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= rating ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    fetchReviews()
      .then((data) => setReviews(data.reviews))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const avgRating = useMemo(() => {
    if (!reviews.length) return null;
    return (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1);
  }, [reviews]);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">My Reviews</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Share your experience with the platform. You can write multiple reviews over time.
            </p>
            {avgRating && (
              <p className="mt-2 text-sm text-muted">
                Your average rating:{" "}
                <span className="font-semibold text-foreground">{avgRating} / 5</span>
              </p>
            )}
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={() => setAddOpen(true)}
          >
            + Write a review
          </Button>
        </div>
      </div>

      {loading && <ListSkeleton rows={3} />}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="px-4 py-2 text-sm">Retry</Button>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            You haven&apos;t written any reviews yet. Use &quot;+ Write a review&quot; above.
          </p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Stars rating={review.rating} />
                  <span className="text-xs text-muted">
                    {new Date(review.created_at).toLocaleDateString()}
                    {review.updated_at !== review.created_at && " (edited)"}
                  </span>
                </div>
                {review.body && (
                  <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{review.body}</p>
                )}
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => setEditTarget(review)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                  onClick={() => setDeleteTarget(review)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AddReviewModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={(newReview) => setReviews((prev) => [newReview, ...prev])}
      />

      <EditReviewModal
        open={editTarget !== null}
        review={editTarget}
        onClose={() => setEditTarget(null)}
        onSuccess={(updated) =>
          setReviews((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
        }
      />

      <DeleteReviewModal
        open={deleteTarget !== null}
        review={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() =>
          setReviews((prev) => prev.filter((r) => r.id !== deleteTarget?.id))
        }
      />
    </main>
  );
}
