import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import MedicationListEditor from "./MedicationListEditor";
import {
  emptyMedication,
  medicationPayload,
  prepareMedications,
} from "../../lib/medications";
import {
  createMedication,
  deleteMedication,
  fetchMedications,
  updateMedication,
  updateSenior,
} from "../../lib/api";

const GENDER_OPTIONS = ["Female", "Male", "Prefer not to say"];

export default function EditSeniorModal({ open, senior, onClose, onSuccess }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    age: "",
    gender: "",
    phone_number: "",
    diagnoses: "",
  });
  const [medications, setMedications] = useState([{ ...emptyMedication }]);
  // ids of the medications that existed when the modal opened — used to detect
  // which ones were removed so we can delete them on save.
  const [originalIds, setOriginalIds] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !senior) return;
    setForm({
      first_name: senior.first_name ?? "",
      last_name: senior.last_name ?? "",
      age: String(senior.age ?? ""),
      gender: senior.gender ?? "",
      phone_number: senior.phone_number ?? "",
      diagnoses: senior.diagnoses ?? "",
    });
    setError("");
    setLoading(false);

    // Load this senior's existing medications into the editor.
    let cancelled = false;
    setMedications([{ ...emptyMedication }]);
    setOriginalIds([]);
    fetchMedications()
      .then((data) => {
        if (cancelled) return;
        const mine = (data.medications ?? []).filter(
          (m) => m.senior_id === senior.id,
        );
        setOriginalIds(mine.map((m) => m.id));
        setMedications(
          mine.length > 0
            ? mine.map((m) => ({
                id: m.id,
                medication_name: m.medication_name ?? "",
                dose: m.dose ?? "",
                scheduled_time: m.scheduled_time ?? "",
                stock: m.stock != null ? String(m.stock) : "",
              }))
            : [{ ...emptyMedication }],
        );
      })
      .catch(() => {
        /* leave the single empty row if medications can't be loaded */
      });
    return () => {
      cancelled = true;
    };
  }, [open, senior]);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const { rows: medRows, error: medError } = prepareMedications(medications);
    if (medError) {
      setError(medError);
      return;
    }

    setLoading(true);
    try {
      const updated = await updateSenior(senior.id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        age: Number(form.age),
        gender: form.gender,
        phone_number: form.phone_number.trim(),
        diagnoses: form.diagnoses.trim(),
      });

      // Reconcile medications: update existing, create new, delete removed.
      const keptIds = [];
      for (const row of medRows) {
        const payload = medicationPayload(row, senior.id);
        if (row.id) {
          keptIds.push(row.id);
          await updateMedication(row.id, {
            medication_name: payload.medication_name,
            dose: payload.dose,
            stock: payload.stock,
            ...(payload.scheduled_time
              ? { scheduled_time: payload.scheduled_time }
              : {}),
          });
        } else {
          await createMedication(payload);
        }
      }
      for (const id of originalIds) {
        if (!keptIds.includes(id)) await deleteMedication(id);
      }

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
      title="Edit senior"
      description="Update details for this person."
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="edit-senior-first-name"
            label="First name"
            required
            value={form.first_name}
            onChange={updateField("first_name")}
            disabled={loading}
          />
          <Input
            id="edit-senior-last-name"
            label="Last name"
            required
            value={form.last_name}
            onChange={updateField("last_name")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="edit-senior-age"
            label="Age"
            type="number"
            min={1}
            max={120}
            required
            value={form.age}
            onChange={updateField("age")}
            disabled={loading}
          />
          <div>
            <label
              htmlFor="edit-senior-gender"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Gender
            </label>
            <select
              id="edit-senior-gender"
              required
              value={form.gender}
              onChange={updateField("gender")}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="" disabled>
                Select gender
              </option>
              {GENDER_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          id="edit-senior-phone"
          label="Phone number"
          type="tel"
          maxLength={12}
          required
          value={form.phone_number}
          onChange={updateField("phone_number")}
          disabled={loading}
        />

        <div>
          <label
            htmlFor="edit-senior-diagnoses"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Diagnoses
          </label>
          <textarea
            id="edit-senior-diagnoses"
            rows={3}
            required
            value={form.diagnoses}
            onChange={updateField("diagnoses")}
            disabled={loading}
            className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

        <MedicationListEditor
          medications={medications}
          onChange={setMedications}
          disabled={loading}
          idPrefix="edit-med"
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
