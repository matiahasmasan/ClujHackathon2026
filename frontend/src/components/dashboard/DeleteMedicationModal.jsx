import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { deleteMedication } from "../../lib/api";

export default function DeleteMedicationModal({
  open,
  medication,
  onClose,
  onSuccess,
}) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!medication) return null;

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      await deleteMedication(medication.id);
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
      title="Delete medication"
      description="This action cannot be undone."
      disabled={loading}
      size="sm"
    >
      <p className="text-sm leading-relaxed text-muted">
        Remove{" "}
        <span className="font-semibold text-foreground">
          {medication.medication_name}
        </span>{" "}
        ({medication.dose} at {medication.scheduled_time}) for{" "}
        <span className="font-semibold text-foreground">
          {medication.senior_name}
        </span>
        ?
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
          {loading ? "Deleting…" : "Delete medication"}
        </Button>
      </div>
    </Modal>
  );
}
