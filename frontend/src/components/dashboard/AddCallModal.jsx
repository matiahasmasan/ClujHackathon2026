import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import CallFormFields from "./CallFormFields";
import { emptyCallForm, formToCreatePayload } from "./callForm";
import { createCall, fetchSeniors } from "../../lib/api";

export default function AddCallModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyCallForm);
  const [seniors, setSeniors] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyCallForm);
    setError("");
    setLoading(false);

    fetchSeniors()
      .then((data) => setSeniors(data.seniors))
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
      const call = await createCall(formToCreatePayload(form));
      onSuccess?.(call);
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
      title="Log wellness call"
      description="Record a new check-in for someone in your care circle."
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
            Add a senior to your circle before logging calls.
          </p>
        )}

        <CallFormFields
          form={form}
          updateField={updateField}
          loading={loading}
          seniors={seniors}
          idPrefix="add-call"
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
            {loading ? "Saving…" : "Log call"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
