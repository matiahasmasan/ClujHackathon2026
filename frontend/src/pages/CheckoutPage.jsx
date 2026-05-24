import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { checkout, fetchPricing } from "../lib/api";

function formatPrice(amount, currency = "USD") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
    }).format(value);
  } catch {
    return `${value.toFixed(2)} ${currency}`;
  }
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.match(/.{1,4}/g)?.join(" ") ?? "";
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function CheckoutPage() {
  const { planId } = useParams();
  const navigate = useNavigate();

  const [plan, setPlan] = useState(null);
  const [planLoading, setPlanLoading] = useState(true);
  const [planError, setPlanError] = useState("");

  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPlanLoading(true);
    setPlanError("");
    fetchPricing()
      .then((data) => {
        if (cancelled) return;
        const found = data.plans.find((p) => String(p.id) === String(planId));
        if (!found) {
          setPlanError("Plan not found.");
        } else {
          setPlan(found);
        }
      })
      .catch((err) => {
        if (!cancelled) setPlanError(err.message);
      })
      .finally(() => {
        if (!cancelled) setPlanLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const priceLabel = useMemo(
    () => (plan ? formatPrice(plan.price_monthly, plan.currency) : "—"),
    [plan],
  );

  async function handleSubmit(event) {
    event.preventDefault();
    if (!plan) return;
    setSubmitting(true);
    setError("");
    try {
      const data = await checkout({
        plan_id: plan.id,
        card_holder: cardHolder.trim(),
        card_number: cardNumber.replace(/\s+/g, ""),
        card_exp: cardExp.trim(),
        card_cvc: cardCvc.trim(),
      });
      setSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (planLoading) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="h-32 animate-pulse rounded-2xl bg-card/75" />
          <div className="h-72 animate-pulse rounded-2xl bg-card/75" />
        </div>
      </main>
    );
  }

  if (planError || !plan) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-3xl rounded-2xl bg-card/75 p-8 text-center shadow-sm backdrop-blur-sm">
          <h1 className="text-xl font-bold text-foreground">Plan unavailable</h1>
          <p className="mt-2 text-sm text-muted">{planError || "We couldn't find that plan."}</p>
          <Button to="/dashboard/subscriptions" className="mt-6 px-5 py-2 text-sm">
            Back to subscriptions
          </Button>
        </div>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex-1 p-6">
        <div className="mx-auto max-w-2xl rounded-2xl bg-card/75 p-8 text-center shadow-sm backdrop-blur-sm">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-secondary/15 text-secondary">
            <svg className="size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
              <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="mt-5 text-2xl font-bold text-foreground">Payment successful</h1>
          <p className="mt-2 text-sm text-muted">
            Your <span className="font-medium text-foreground">{success.plan_name}</span> subscription is now active.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-surface/60 p-4 text-left">
              <p className="text-xs uppercase tracking-wide text-muted">Amount charged</p>
              <p className="mt-1 text-lg font-semibold text-foreground">
                {formatPrice(success.payment.amount / 100, success.payment.currency)}
              </p>
            </div>
            <div className="rounded-xl bg-surface/60 p-4 text-left">
              <p className="text-xs uppercase tracking-wide text-muted">Invoice</p>
              <p className="mt-1 truncate font-mono text-xs text-foreground">
                {success.payment.stripe_invoice_id}
              </p>
            </div>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button
              to="/dashboard/subscriptions"
              variant="outline"
              className="px-5 py-2 text-sm"
            >
              View subscription
            </Button>
            <Button
              onClick={() => navigate("/dashboard/payments")}
              className="px-5 py-2 text-sm"
            >
              View payments
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 sm:p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Complete your purchase</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            This is a simulated checkout — no real card is charged. Use any test details to create a subscription.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl bg-card/75 p-6 shadow-sm backdrop-blur-sm sm:p-8"
          >
            <h2 className="text-lg font-semibold text-foreground">Card details</h2>
            <p className="mt-1 text-sm text-muted">Enter any values — this is for demonstration only.</p>

            <div className="mt-6 space-y-4">
              <Input
                label="Cardholder name"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="Jane Doe"
                required
                disabled={submitting}
              />
              <Input
                label="Card number"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="4242 4242 4242 4242"
                inputMode="numeric"
                autoComplete="cc-number"
                required
                disabled={submitting}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  label="Expiry (MM/YY)"
                  value={cardExp}
                  onChange={(e) => setCardExp(formatExpiry(e.target.value))}
                  placeholder="12/28"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  required
                  disabled={submitting}
                />
                <Input
                  label="CVC"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  required
                  disabled={submitting}
                />
              </div>
            </div>

            {error && (
              <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" className="mt-6 w-full py-3" disabled={submitting}>
              {submitting ? "Processing payment…" : `Pay ${priceLabel}`}
            </Button>

            <p className="mt-4 text-center text-xs text-muted">
              <Link to="/dashboard/subscriptions" className="hover:text-foreground">
                Cancel and go back
              </Link>
            </p>
          </form>

          <aside className="h-fit rounded-2xl bg-card/75 p-6 shadow-sm backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-foreground">Order summary</h2>
            <div className="mt-4 space-y-3">
              <div>
                <p className="text-sm text-muted">Plan</p>
                <p className="mt-0.5 font-semibold text-foreground">{plan.name}</p>
                {plan.tagline && <p className="text-xs text-muted">{plan.tagline}</p>}
              </div>
              <div className="border-t border-border/40 pt-3">
                <p className="text-sm text-muted">Total today</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{priceLabel}</p>
                <p className="text-xs text-muted">Billed monthly · cancel anytime</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
