import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { updateUser } from "../../lib/api";

export default function EditUserModal({ open, user, onClose, onSuccess }) {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone_number: "",
    role: "caregiver",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !user) return;
    setForm({
      first_name: user.first_name ?? "",
      last_name: user.last_name ?? "",
      email: user.email ?? "",
      phone_number: user.phone_number ?? "",
      role: user.role ?? "caregiver",
    });
    setError("");
    setLoading(false);
  }, [open, user]);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const updated = await updateUser(user.id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        phone_number: form.phone_number.trim() || null,
        role: form.role,
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
      title="Edit user"
      description="Update account details."
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
            id="edit-user-first-name"
            label="First name"
            required
            value={form.first_name}
            onChange={field("first_name")}
            disabled={loading}
          />
          <Input
            id="edit-user-last-name"
            label="Last name"
            required
            value={form.last_name}
            onChange={field("last_name")}
            disabled={loading}
          />
        </div>

        <Input
          id="edit-user-email"
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={field("email")}
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="edit-user-phone"
            label="Phone number"
            type="tel"
            value={form.phone_number}
            onChange={field("phone_number")}
            disabled={loading}
          />
          <div>
            <label
              htmlFor="edit-user-role"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Role
            </label>
            <select
              id="edit-user-role"
              value={form.role}
              onChange={field("role")}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            >
              <option value="caregiver">Caregiver</option>
              <option value="admin">Admin</option>
            </select>
          </div>
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
            {loading ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
