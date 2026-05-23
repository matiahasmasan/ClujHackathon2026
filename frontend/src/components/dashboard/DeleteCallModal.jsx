import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { deleteCall } from "../../lib/api";

export default function DeleteCallModal({ open, call, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!call) return null;

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      await deleteCall(call.id);
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
      title="Delete call"
      description="This action cannot be undone."
      disabled={loading}
      size="sm"
    >
      <p className="text-sm leading-relaxed text-muted">
        Remove the wellness call with{" "}
        <span className="font-semibold text-foreground">{call.senior_name}</span>{" "}
        from your history?
      </p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="flex flex-col-reverse gap-3 pt-6 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onClose}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="button"
          className="w-full bg-red-600 hover:bg-red-600/90 sm:w-auto"
          onClick={handleDelete}
          disabled={loading}
        >
          {loading ? "Deleting…" : "Delete call"}
        </Button>
      </div>
    </Modal>
  );
}
