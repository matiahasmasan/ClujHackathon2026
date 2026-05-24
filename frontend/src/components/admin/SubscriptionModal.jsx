import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createSubscription, updateSubscription } from "../../lib/api";

const empty = {
  user_id: "",
  plan_id: "",
  stripe_customer_id: "",
  stripe_subscription_id: "",
  status: "active",
  current_period_start: "",
  current_period_end: "",
  cancel_at_period_end: false,
  canceled_at: "",
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

export default function SubscriptionModal({ open, subscription, users, plans, onClose, onSuccess }) {
  const isEdit = subscription != null;
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
            user_id: String(subscription.user_id ?? ""),
            plan_id: String(subscription.plan_id ?? ""),
            stripe_customer_id: subscription.stripe_customer_id ?? "",
            stripe_subscription_id: subscription.stripe_subscription_id ?? "",
            status: subscription.status ?? "active",
            current_period_start: toDatetimeLocal(subscription.current_period_start),
            current_period_end: toDatetimeLocal(subscription.current_period_end),
            cancel_at_period_end: subscription.cancel_at_period_end ?? false,
            canceled_at: toDatetimeLocal(subscription.canceled_at),
          }
        : empty,
    );
  }, [open, subscription, isEdit]);

  function field(key) {
    return (e) => {
      const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      setForm((prev) => ({ ...prev, [key]: value }));
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const periodStart = fromDatetimeLocal(form.current_period_start);
      const periodEnd = fromDatetimeLocal(form.current_period_end);
      if (!periodStart || !periodEnd) {
        throw new Error("Billing period start and end are required.");
      }

      const payload = {
        user_id: Number(form.user_id),
        plan_id: Number(form.plan_id),
        stripe_customer_id: form.stripe_customer_id.trim(),
        stripe_subscription_id: form.stripe_subscription_id.trim(),
        status: form.status,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        cancel_at_period_end: form.cancel_at_period_end,
        canceled_at: fromDatetimeLocal(form.canceled_at),
      };

      const result = isEdit
        ? await updateSubscription(subscription.id, payload)
        : await createSubscription(payload);
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
      title={isEdit ? "Edit subscription" : "Add subscription"}
      description={
        isEdit
          ? "Update subscription details for this caregiver."
          : "Create a subscription for a caregiver. Each user can only have one."
      }
      disabled={loading}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div>
          <label htmlFor="subscription-user" className="mb-2 block text-sm font-semibold text-foreground">
            Caregiver
          </label>
          <select
            id="subscription-user"
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

        <div>
          <label htmlFor="subscription-plan" className="mb-2 block text-sm font-semibold text-foreground">
            Plan
          </label>
          <select
            id="subscription-plan"
            value={form.plan_id}
            onChange={field("plan_id")}
            required
            disabled={loading}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">Select a plan…</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} — {plan.price_monthly}/mo
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="subscription-status" className="mb-2 block text-sm font-semibold text-foreground">
            Status
          </label>
          <select
            id="subscription-status"
            value={form.status}
            onChange={field("status")}
            required
            disabled={loading}
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past due</option>
            <option value="canceled">Canceled</option>
            <option value="incomplete">Incomplete</option>
            <option value="unpaid">Unpaid</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <Input
          label="Stripe customer ID"
          value={form.stripe_customer_id}
          onChange={field("stripe_customer_id")}
          placeholder="cus_…"
          required
          disabled={loading}
        />

        <Input
          label="Stripe subscription ID"
          value={form.stripe_subscription_id}
          onChange={field("stripe_subscription_id")}
          placeholder="sub_…"
          required
          disabled={loading}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Period start"
            type="datetime-local"
            value={form.current_period_start}
            onChange={field("current_period_start")}
            required
            disabled={loading}
          />
          <Input
            label="Period end"
            type="datetime-local"
            value={form.current_period_end}
            onChange={field("current_period_end")}
            required
            disabled={loading}
          />
        </div>

        <Input
          label="Canceled at"
          type="datetime-local"
          value={form.canceled_at}
          onChange={field("canceled_at")}
          disabled={loading}
        />

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.cancel_at_period_end}
            onChange={field("cancel_at_period_end")}
            disabled={loading}
            className="size-4 rounded border-border text-primary focus:ring-primary/20"
          />
          Cancel at period end
        </label>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? "Saving…" : isEdit ? "Save changes" : "Add subscription"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
