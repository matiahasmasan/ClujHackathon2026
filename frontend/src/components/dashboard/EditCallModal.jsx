import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import CallFormFields from "./CallFormFields";
import { emptyCallForm, callToForm, formToUpdatePayload } from "./callForm";
import { fetchSeniors, updateCall } from "../../lib/api";

export default function EditCallModal({ open, call, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyCallForm);
  const [seniors, setSeniors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !call) return;
    setForm(callToForm(call));
    setError("");
    setLoading(false);

    fetchSeniors()
      .then((data) => setSeniors(data.seniors))
      .catch(() => setSeniors([]));
  }, [open, call]);

  if (!call) return null;

  function updateField(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const updated = await updateCall(call.id, formToUpdatePayload(form));
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
      title="Edit call"
      description={`Update record for ${call.senior_name}`}
      disabled={loading}
      size="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <CallFormFields
          form={form}
          updateField={updateField}
          loading={loading}
          seniors={seniors}
          idPrefix={`edit-call-${call.id}`}
          showStatus
          showCareNotes
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
