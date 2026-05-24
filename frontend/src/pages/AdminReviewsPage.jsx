import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import { fetchAllReviews, deleteReview } from "../lib/api";
import { getInitials } from "../lib/auth";
import Modal from "../components/ui/Modal";
import {
  ListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";

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

function DeleteReviewModal({ open, review, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      await deleteReview(review.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Remove review"
      description="This will permanently delete the review."
      disabled={loading}
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <p className="text-sm text-muted">
          Remove the {review?.rating}-star review by{" "}
          <span className="font-medium text-foreground">
            {review?.user_first_name} {review?.user_last_name}
          </span>
          ? This cannot be undone.
        </p>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-600/90 sm:w-auto"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Removing…" : "Remove review"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    fetchAllReviews()
      .then((data) => setReviews(data.reviews))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    if (!reviews.length) return { total: 0, avg: "—", fiveStars: 0 };
    const avg = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);
    return {
      total: reviews.length,
      avg,
      fiveStars: reviews.filter((r) => r.rating === 5).length,
    };
  }, [reviews]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return reviews;
    return reviews.filter(
      (r) =>
        `${r.user_first_name} ${r.user_last_name}`.toLowerCase().includes(q) ||
        r.user_email.toLowerCase().includes(q) ||
        r.body?.toLowerCase().includes(q),
    );
  }, [reviews, query]);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Reviews</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            All platform reviews from caregivers. You can remove inappropriate or spam reviews.
          </p>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">Search reviews</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, email, or review text…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/75 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {/* Stat cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total reviews" value={String(stats.total)} sub="From all caregivers" icon="users" />
          <StatCard label="Average rating" value={stats.avg} sub="Out of 5 stars" icon="alert" />
          <StatCard label="5-star reviews" value={String(stats.fiveStars)} sub="Top ratings" icon="phone" />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={3} />
          <ListSkeleton rows={4} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="px-4 py-2 text-sm">Retry</Button>
        </div>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No reviews have been submitted yet.</p>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No reviews match &quot;{query}&quot;.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {filtered.map((review) => (
            <li
              key={review.id}
              className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(review.user_first_name, review.user_last_name)}
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {review.user_first_name} {review.user_last_name}
                  </p>
                  <p className="text-xs text-muted">{review.user_email}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <Stars rating={review.rating} />
                    <span className="text-xs text-muted">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {review.body && (
                    <p className="mt-2 text-sm text-foreground/80 whitespace-pre-wrap">{review.body}</p>
                  )}
                </div>
              </div>

              <Button
                type="button"
                className="shrink-0 bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                onClick={() => setDeleteTarget(review)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      )}

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
