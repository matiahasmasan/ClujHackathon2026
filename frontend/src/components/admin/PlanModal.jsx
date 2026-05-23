import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import Modal from "../ui/Modal";
import { createPlan, updatePlan } from "../../lib/api";

const empty = {
  name: "",
  tagline: "",
  price_monthly: "",
  price_yearly: "",
  currency: "USD",
  is_highlighted: false,
  cta_label: "Get Started",
  cta_href: "/signup",
  sort_order: "0",
};

export default function PlanModal({ open, plan, onClose, onSuccess }) {
  const isEdit = plan != null;
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
            name: plan.name ?? "",
            tagline: plan.tagline ?? "",
            price_monthly: String(plan.price_monthly ?? ""),
            price_yearly: String(plan.price_yearly ?? ""),
            currency: plan.currency ?? "USD",
            is_highlighted: plan.is_highlighted ?? false,
            cta_label: plan.cta_label ?? "Get Started",
            cta_href: plan.cta_href ?? "/signup",
            sort_order: String(plan.sort_order ?? 0),
          }
        : empty,
    );
  }, [open, plan, isEdit]);

  function field(key) {
    return (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        price_monthly: Number(form.price_monthly),
        price_yearly: form.price_yearly !== "" ? Number(form.price_yearly) : null,
        currency: form.currency.trim().toUpperCase(),
        is_highlighted: form.is_highlighted,
        cta_label: form.cta_label.trim(),
        cta_href: form.cta_href.trim(),
        sort_order: Number(form.sort_order),
      };
      const result = isEdit
        ? await updatePlan(plan.id, payload)
        : await createPlan(payload);
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
      title={isEdit ? "Edit plan" : "Add plan"}
      description={isEdit ? "Update pricing plan details." : "Create a new pricing plan."}
      disabled={loading}
      size="lg"
    >
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error && (
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="plan-name"
            label="Plan name"
            placeholder="Pro"
            required
            value={form.name}
            onChange={field("name")}
            disabled={loading}
          />
          <Input
            id="plan-tagline"
            label="Tagline"
            placeholder="For growing families"
            value={form.tagline}
            onChange={field("tagline")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Input
            id="plan-price-monthly"
            label="Monthly price"
            type="number"
            min={0}
            step="0.01"
            placeholder="29"
            required
            value={form.price_monthly}
            onChange={field("price_monthly")}
            disabled={loading}
          />
          <Input
            id="plan-price-yearly"
            label="Yearly price (optional)"
            type="number"
            min={0}
            step="0.01"
            placeholder="299"
            value={form.price_yearly}
            onChange={field("price_yearly")}
            disabled={loading}
          />
          <Input
            id="plan-currency"
            label="Currency"
            placeholder="USD"
            maxLength={3}
            required
            value={form.currency}
            onChange={field("currency")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="plan-cta-label"
            label="Button label"
            placeholder="Get Started"
            required
            value={form.cta_label}
            onChange={field("cta_label")}
            disabled={loading}
          />
          <Input
            id="plan-cta-href"
            label="Button link"
            placeholder="/signup"
            required
            value={form.cta_href}
            onChange={field("cta_href")}
            disabled={loading}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="plan-sort-order"
            label="Sort order"
            type="number"
            min={0}
            placeholder="0"
            value={form.sort_order}
            onChange={field("sort_order")}
            disabled={loading}
          />
          <div className="flex items-center gap-3 pt-7">
            <input
              id="plan-highlighted"
              type="checkbox"
              checked={form.is_highlighted}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, is_highlighted: e.target.checked }))
              }
              disabled={loading}
              className="size-4 rounded border-border accent-primary"
            />
            <label htmlFor="plan-highlighted" className="text-sm font-semibold text-foreground">
              Most Popular highlight
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
            {loading ? (isEdit ? "Saving…" : "Creating…") : isEdit ? "Save changes" : "Create plan"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
