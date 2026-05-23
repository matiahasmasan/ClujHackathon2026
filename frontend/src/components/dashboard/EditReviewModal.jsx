import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { updateReview } from "../../lib/api";

function StarPicker({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          className="text-2xl transition-transform hover:scale-110 disabled:opacity-50"
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
        >
          <span className={star <= value ? "text-yellow-400" : "text-gray-300"}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function EditReviewModal({ open, review, onClose, onSuccess }) {
  const [form, setForm] = useState({ rating: "", body: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !review) return;
    setForm({ rating: review.rating ?? "", body: review.body ?? "" });
    setError("");
    setLoading(false);
  }, [open, review]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.rating) {
      setError("Please select a star rating.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const updated = await updateReview(review.id, {
        rating: Number(form.rating),
        body: form.body.trim() || null,
      });
      onSuccess?.(updated);
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
      title="Edit review"
      description="Update your rating or review text."
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label className="mb-2 block text-sm font-semibold text-foreground">Rating</label>
          <StarPicker
            value={Number(form.rating)}
            onChange={(v) => setForm((prev) => ({ ...prev, rating: v }))}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="edit-review-body" className="mb-2 block text-sm font-semibold text-foreground">
            Review <span className="font-normal text-muted">(optional)</span>
          </label>
          <textarea
            id="edit-review-body"
            rows={4}
            placeholder="Tell us what you think…"
            value={form.body}
            onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
            disabled={loading}
            maxLength={2000}
            className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
