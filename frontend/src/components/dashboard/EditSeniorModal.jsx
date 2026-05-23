import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import SeniorFormFields from "./SeniorFormFields";
import {
  emptySeniorForm,
  formToPayload,
  seniorToForm,
} from "./seniorForm";
import { updateSenior } from "../../lib/api";

export default function EditSeniorModal({ open, senior, onClose, onSuccess }) {
  const [form, setForm] = useState(emptySeniorForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !senior) return;
    setForm(seniorToForm(senior));
    setError("");
    setLoading(false);
  }, [open, senior]);

  if (!senior) return null;

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updated = await updateSenior(senior.id, formToPayload(form));
      onSuccess?.(updated);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const name = `${senior.first_name} ${senior.last_name}`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit senior"
      description={`Update profile for ${name}`}
      disabled={loading}
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <SeniorFormFields
          form={form}
          updateField={updateField}
          loading={loading}
          idPrefix={`edit-senior-${senior.id}`}
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
