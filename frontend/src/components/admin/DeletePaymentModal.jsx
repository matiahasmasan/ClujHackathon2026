import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { deletePayment } from "../../lib/api";
import { formatPaymentAmount } from "../../lib/payments";

export default function DeletePaymentModal({ open, payment, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      await deletePayment(payment.id);
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
      title="Delete payment"
      description="This will permanently remove the payment record."
      disabled={loading}
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <p className="text-sm text-muted">
          Delete the {formatPaymentAmount(payment?.amount, payment?.currency)} payment
          {payment?.user_first_name ? (
            <>
              {" "}
              for{" "}
              <span className="font-medium text-foreground">
                {payment.user_first_name} {payment.user_last_name}
              </span>
            </>
          ) : null}
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
            {loading ? "Deleting…" : "Delete payment"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
