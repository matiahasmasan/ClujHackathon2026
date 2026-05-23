import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { updateMedication } from "../../lib/api";

export default function EditMedicationModal({
  open,
  medication,
  onClose,
  onSuccess,
}) {
  const [form, setForm] = useState({
    medication_name: "",
    dose: "",
    scheduled_time: "",
    stock: "0",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !medication) return;
    setForm({
      medication_name: medication.medication_name ?? "",
      dose: medication.dose ?? "",
      scheduled_time: medication.scheduled_time?.slice(0, 5) ?? "",
      stock: String(medication.stock ?? 0),
    });
    setError("");
    setLoading(false);
  }, [open, medication]);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const updated = await updateMedication(medication.id, {
        medication_name: form.medication_name.trim(),
        dose: form.dose.trim(),
        scheduled_time: form.scheduled_time,
        stock: Number(form.stock) || 0,
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
      title="Edit medication"
      description="Update the medication details."
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <Input
          id="edit-med-name"
          label="Medication name"
          placeholder="e.g. Metformin"
          required
          value={form.medication_name}
          onChange={updateField("medication_name")}
          disabled={loading}
        />

        <Input
          id="edit-med-dose"
          label="Dose"
          placeholder="e.g. 500 mg"
          required
          value={form.dose}
          onChange={updateField("dose")}
          disabled={loading}
        />

        <Input
          id="edit-med-time"
          label="Scheduled time"
          type="time"
          required
          value={form.scheduled_time}
          onChange={updateField("scheduled_time")}
          disabled={loading}
        />

        <Input
          id="edit-med-stock"
          label="Stock (units)"
          type="number"
          min="0"
          placeholder="e.g. 30"
          value={form.stock}
          onChange={updateField("stock")}
          disabled={loading}
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
