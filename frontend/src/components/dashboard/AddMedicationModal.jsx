import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import MedicationFormFields from "./MedicationFormFields";
import { emptyMedicationForm, formToCreatePayload } from "./medicationForm";
import { createMedication, fetchSeniors } from "../../lib/api";

export default function AddMedicationModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyMedicationForm);
  const [seniors, setSeniors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyMedicationForm);
    setError("");
    setLoading(false);

    fetchSeniors()
      .then((data) => setSeniors(data.seniors))
      .catch(() => setSeniors([]));
  }, [open]);

  function updateField(field) {
    return (e) => {
      const value =
        field === "is_taken_today" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const medication = await createMedication(formToCreatePayload(form));
      onSuccess?.(medication);
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
      title="Add medication"
      description="Schedule a daily dose for someone in your care circle."
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        {seniors.length === 0 && (
          <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Add a senior to your circle before scheduling medications.
          </p>
        )}

        <MedicationFormFields
          form={form}
          updateField={updateField}
          loading={loading}
          seniors={seniors}
          idPrefix="add-medication"
        />

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
            type="submit"
            className="w-full sm:w-auto"
            disabled={loading || seniors.length === 0}
          >
            {loading ? "Adding…" : "Add medication"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
