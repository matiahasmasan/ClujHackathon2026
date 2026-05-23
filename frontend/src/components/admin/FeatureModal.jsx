import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createFeature, updateFeature } from "../../lib/api";

export default function FeatureModal({ open, planId, feature, onClose, onSuccess }) {
  const isEdit = feature != null;
  const [label, setLabel] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setLabel(feature?.label ?? "");
    setSortOrder(String(feature?.sort_order ?? 0));
  }, [open, feature]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = { label: label.trim(), sort_order: Number(sortOrder) };
      const result = isEdit
        ? await updateFeature(feature.id, payload)
        : await createFeature(planId, payload);
      onSuccess?.(result);
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
      title={isEdit ? "Edit feature" : "Add feature"}
      description="A short line describing what's included in this plan."
      disabled={loading}
      size="sm"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}
        <Input
          id="feature-label"
          label="Label"
          placeholder="Unlimited wellness calls"
          required
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          disabled={loading}
        />
        <Input
          id="feature-sort-order"
          label="Sort order"
          type="number"
          min={0}
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          disabled={loading}
        />
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add feature"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
