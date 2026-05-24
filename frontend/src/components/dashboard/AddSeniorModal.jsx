import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createSenior } from "../../lib/api";

const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Other",
  "Prefer not to say",
];

const emptyForm = {
  first_name: "",
  last_name: "",
  age: "",
  gender: "",
  phone_number: "",
  diagnoses: "",
};

export default function AddSeniorModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError("");
    setLoading(false);
  }, [open]);

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const senior = await createSenior({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        age: Number(form.age),
        gender: form.gender,
        phone_number: form.phone_number.trim(),
        diagnoses: form.diagnoses.trim(),
      });
      onSuccess?.(senior);
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
      title="Add senior"
      description="Add someone to your care circle. Details can be edited later."
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
            id="senior-first-name"
            label="First name"
            placeholder="Margaret"
            required
            autoComplete="given-name"
            value={form.first_name}
            onChange={updateField("first_name")}
            disabled={loading}
          />
          <Input
            id="senior-last-name"
            label="Last name"
            placeholder="Hill"
            required
            autoComplete="family-name"
            value={form.last_name}
            onChange={updateField("last_name")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="senior-age"
            label="Age"
            type="number"
            min={1}
            max={120}
            placeholder="82"
            required
            value={form.age}
            onChange={updateField("age")}
            disabled={loading}
          />
          <div>
            <label
              htmlFor="senior-gender"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Gender
            </label>
            <select
              id="senior-gender"
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
          id="senior-phone"
          label="Phone number"
          type="tel"
          placeholder="0712345678"
          maxLength={11}
          required
          autoComplete="tel"
          value={form.phone_number}
          onChange={updateField("phone_number")}
          disabled={loading}
        />

        <div>
          <label
            htmlFor="senior-diagnoses"
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Diagnoses
          </label>
          <textarea
            id="senior-diagnoses"
            rows={3}
            required
            placeholder="e.g. Early-stage dementia, hypertension"
            value={form.diagnoses}
            onChange={updateField("diagnoses")}
            disabled={loading}
            className="w-full resize-y rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          />
        </div>

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
            {loading ? "Adding…" : "Add senior"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
