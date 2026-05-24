import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { cancelMySubscription } from "../../lib/api";
import { formatSubscriptionDate } from "../../lib/subscriptions";

export default function CancelSubscriptionModal({ open, subscription, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    setError("");
    setLoading(true);
    try {
      const updated = await cancelMySubscription();
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
      title="Cancel subscription"
      description="Your plan stays active until the end of the current billing period."
      disabled={loading}
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <p className="text-sm text-muted">
          Cancel your{" "}
          <span className="font-medium text-foreground">
            {subscription?.plan_name ?? "subscription"}
          </span>
          ? You&apos;ll keep access until{" "}
          <span className="font-medium text-foreground">
            {formatSubscriptionDate(subscription?.current_period_end)}
          </span>
          .
        </p>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Keep subscription
          </Button>
          <Button
            type="button"
            className="w-full bg-red-600 hover:bg-red-600/90 sm:w-auto"
            onClick={handleCancel}
            disabled={loading}
          >
            {loading ? "Canceling…" : "Cancel subscription"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
