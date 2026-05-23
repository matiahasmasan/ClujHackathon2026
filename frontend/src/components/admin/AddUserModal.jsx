import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createUser } from "../../lib/api";

const emptyForm = {
  first_name: "",
  last_name: "",
  email: "",
  password: "",
  phone_number: "",
  role: "caregiver",
};

export default function AddUserModal({ open, onClose, onSuccess }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
    setError("");
    setLoading(false);
  }, [open]);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await createUser({
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        email: form.email.trim(),
        password: form.password,
        phone_number: form.phone_number.trim() || null,
        role: form.role,
      });
      onSuccess?.(user);
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
      title="Add user"
      description="Create a new account. The user can change their password later."
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
            id="add-user-first-name"
            label="First name"
            placeholder="Jane"
            required
            value={form.first_name}
            onChange={field("first_name")}
            disabled={loading}
          />
          <Input
            id="add-user-last-name"
            label="Last name"
            placeholder="Doe"
            required
            value={form.last_name}
            onChange={field("last_name")}
            disabled={loading}
          />
        </div>

        <Input
          id="add-user-email"
          label="Email"
          type="email"
          placeholder="jane@example.com"
          required
          value={form.email}
          onChange={field("email")}
          disabled={loading}
        />

        <Input
          id="add-user-password"
          label="Password"
          type="password"
          placeholder="Min. 8 characters"
          required
          minLength={8}
          value={form.password}
          onChange={field("password")}
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="add-user-phone"
            label="Phone number"
            type="tel"
            placeholder="0712345678"
            value={form.phone_number}
            onChange={field("phone_number")}
            disabled={loading}
          />
          <div>
            <label
              htmlFor="add-user-role"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Role
            </label>
            <select
              id="add-user-role"
              value={form.role}
              onChange={field("role")}
              disabled={loading}
              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
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
            {loading ? "Creating…" : "Create user"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
