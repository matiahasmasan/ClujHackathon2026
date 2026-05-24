import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createPayment, updatePayment } from "../../lib/api";

const empty = {
  user_id: "",
  subscription_id: "",
  stripe_payment_intent_id: "",
  stripe_invoice_id: "",
  amount: "",
  currency: "USD",
  status: "pending",
  paid_at: "",
  failed_at: "",
  failure_reason: "",
};

function toDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60 * 1000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  if (!value) return null;
  return new Date(value).toISOString();
}

export default function PaymentModal({ open, payment, users, onClose, onSuccess }) {
  const isEdit = payment != null;
  const [form, setForm] = useState(empty);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setForm(
      isEdit
        ? {
            user_id: String(payment.user_id ?? ""),
            subscription_id: payment.subscription_id != null ? String(payment.subscription_id) : "",
            stripe_payment_intent_id: payment.stripe_payment_intent_id ?? "",
            stripe_invoice_id: payment.stripe_invoice_id ?? "",
            amount: String((payment.amount ?? 0) / 100),
            currency: payment.currency ?? "USD",
            status: payment.status ?? "pending",
            paid_at: toDatetimeLocal(payment.paid_at),
            failed_at: toDatetimeLocal(payment.failed_at),
            failure_reason: payment.failure_reason ?? "",
          }
        : empty,
    );
  }, [open, payment, isEdit]);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const amountCents = Math.round(Number(form.amount) * 100);
      if (!Number.isFinite(amountCents) || amountCents <= 0) {
        throw new Error("Amount must be greater than zero.");
      }

      const payload = {
        user_id: Number(form.user_id),
        subscription_id: form.subscription_id !== "" ? Number(form.subscription_id) : null,
        stripe_payment_intent_id: form.stripe_payment_intent_id.trim() || null,
        stripe_invoice_id: form.stripe_invoice_id.trim() || null,
        amount: amountCents,
        currency: form.currency.trim().toUpperCase(),
        status: form.status,
        paid_at: fromDatetimeLocal(form.paid_at),
        failed_at: fromDatetimeLocal(form.failed_at),
        failure_reason: form.failure_reason.trim() || null,
      };

      const result = isEdit
        ? await updatePayment(payment.id, payload)
        : await createPayment(payload);
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
      title={isEdit ? "Edit payment" : "Add payment"}
      description={isEdit ? "Update payment record details." : "Create a new payment record for a caregiver."}
      disabled={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label htmlFor="payment-user" className="mb-2 block text-sm font-semibold text-foreground">
            Caregiver
          </label>
          <select
            id="payment-user"
            value={form.user_id}
            onChange={field("user_id")}
            required
            disabled={loading}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a user…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.first_name} {user.last_name} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Amount"
            type="number"
            min="0.01"
            step="0.01"
            value={form.amount}
            onChange={field("amount")}
            placeholder="29.99"
            required
            disabled={loading}
          />
          <Input
            label="Currency"
            value={form.currency}
            onChange={field("currency")}
            maxLength={3}
            required
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="payment-status" className="mb-2 block text-sm font-semibold text-foreground">
            Status
          </label>
          <select
            id="payment-status"
            value={form.status}
            onChange={field("status")}
            required
            disabled={loading}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="pending">Pending</option>
            <option value="succeeded">Succeeded</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
            <option value="canceled">Canceled</option>
          </select>
        </div>

        <Input
          label="Subscription ID (optional)"
          type="number"
          min="1"
          value={form.subscription_id}
          onChange={field("subscription_id")}
          placeholder="Leave blank if none"
          disabled={loading}
        />

        <Input
          label="Stripe payment intent ID"
          value={form.stripe_payment_intent_id}
          onChange={field("stripe_payment_intent_id")}
          placeholder="pi_…"
          disabled={loading}
        />

        <Input
          label="Stripe invoice ID"
          value={form.stripe_invoice_id}
          onChange={field("stripe_invoice_id")}
          placeholder="in_…"
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Paid at"
            type="datetime-local"
            value={form.paid_at}
            onChange={field("paid_at")}
            disabled={loading}
          />
          <Input
            label="Failed at"
            type="datetime-local"
            value={form.failed_at}
            onChange={field("failed_at")}
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="payment-failure-reason" className="mb-2 block text-sm font-semibold text-foreground">
            Failure reason
          </label>
          <textarea
            id="payment-failure-reason"
            value={form.failure_reason}
            onChange={field("failure_reason")}
            rows={3}
            disabled={loading}
            placeholder="Optional — shown for failed payments"
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add payment"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
