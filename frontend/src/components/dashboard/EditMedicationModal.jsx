import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import MedicationFormFields from "./MedicationFormFields";
import {
  emptyMedicationForm,
  formToUpdatePayload,
  medicationToForm,
} from "./medicationForm";
import { fetchSeniors, updateMedication } from "../../lib/api";

export default function EditMedicationModal({
  open,
  medication,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState(emptyMedicationForm);
  const [seniors, setSeniors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !medication) return;
    setForm(medicationToForm(medication));
    setError("");
    setLoading(false);

    fetchSeniors()
      .then((data) => setSeniors(data.seniors))
      .catch(() => setSeniors([]));
  }, [open, medication]);

  if (!medication) return null;

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
      const updated = await updateMedication(
        medication.id,
        formToUpdatePayload(form),
      );
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
      title="Edit medication"
      description={`Update schedule for ${medication.medication_name}`}
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <MedicationFormFields
          form={form}
          updateField={updateField}
          loading={loading}
          seniors={seniors}
          idPrefix={`edit-medication-${medication.id}`}
          showTakenStatus
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
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
