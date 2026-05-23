import { useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { deleteUser } from "../../lib/api";

export default function DeleteUserModal({ open, user, onClose, onSuccess }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setError("");
    setLoading(true);
    try {
      await deleteUser(user.id);
      onSuccess?.();
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
      title="Delete user"
      description={
        user
          ? `Permanently delete ${user.first_name} ${user.last_name} (${user.email})? This action cannot be undone.`
          : undefined
      }
      disabled={loading}
    >
      <div className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
            type="button"
            className="w-full bg-red-600 hover:bg-red-600/90 sm:w-auto"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Deleting…" : "Delete user"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
