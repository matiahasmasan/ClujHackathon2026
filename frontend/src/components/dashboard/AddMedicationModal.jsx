import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createMedication, fetchSeniors } from "../../lib/api";

const emptyForm = {
  senior_id: "",
  medication_name: "",
  dose: "",
  scheduled_time: "",
  stock: "0",
};

export default function AddMedicationModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [seniors, setSeniors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError("");
    setLoading(false);
    fetchSeniors()
      .then((data) => setSeniors(data.seniors ?? []))
      .catch(() => setSeniors([]));
  }, [open]);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const med = await createMedication({
        senior_id: Number(form.senior_id),
        medication_name: form.medication_name.trim(),
        dose: form.dose.trim(),
        scheduled_time: form.scheduled_time,
        stock: Number(form.stock) || 0,
      });
      onSuccess?.(med);
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
      description="Schedule a daily medication for someone in your circle."
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div>
          <label
            htmlFor="med-senior"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Senior
          </label>
          <select
            id="med-senior"
            required
            value={form.senior_id}
            onChange={updateField("senior_id")}
            disabled={loading}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="" disabled>
              Select senior
            </option>
            {seniors.map((s) => (
              <option key={s.id} value={s.id}>
                {s.first_name} {s.last_name}
              </option>
            ))}
          </select>
        </div>

        <Input
          id="med-name"
          label="Medication name"
          placeholder="e.g. Metformin"
          required
          value={form.medication_name}
          onChange={updateField("medication_name")}
          disabled={loading}
        />

        <Input
          id="med-dose"
          label="Dose"
          placeholder="e.g. 500 mg"
          required
          value={form.dose}
          onChange={updateField("dose")}
          disabled={loading}
        />

        <Input
          id="med-time"
          label="Scheduled time"
          type="time"
          required
          value={form.scheduled_time}
          onChange={updateField("scheduled_time")}
          disabled={loading}
        />

        <Input
          id="med-stock"
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
            {loading ? "Adding…" : "Add medication"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
