import Button from "../ui/Button";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-secondary"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function formatPrice(amount, currency = "USD") {
  const value = Number(amount);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function yearlySavings(monthly, yearly) {
  if (!yearly) return null;
  const saved = Number(monthly) * 12 - Number(yearly);
  if (saved <= 0) return null;
  return saved;
}

export default function PricingCard({ plan }) {
  const savings = yearlySavings(plan.price_monthly, plan.price_yearly);
  const isHighlighted = plan.is_highlighted;
  const buttonClass = "mt-8 w-full py-2.5 text-sm";

  return (
    <article
      className={`relative flex flex-col rounded-2xl p-6 transition-shadow sm:p-8 ${
        isHighlighted
          ? "z-10 bg-card shadow-xl shadow-primary/15 ring-2 ring-primary/20"
          : "bg-card/75 shadow-sm backdrop-blur-sm hover:shadow-md"
      }`}
    >
      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          Most Popular
        </span>
      )}

      <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
      <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-4xl font-bold tracking-tight text-foreground">
          {formatPrice(plan.price_monthly, plan.currency)}
        </span>
        <span className="text-sm text-muted">/month</span>
      </div>

      {savings != null && (
        <p className="mt-1 text-sm text-secondary">
          Save {formatPrice(savings, plan.currency)}/year with annual billing
        </p>
      )}

      <ul className="mt-6 flex flex-1 flex-col gap-3">
        {plan.features.map((feature) => (
          <li key={feature.id} className="flex items-start gap-2.5 text-sm text-foreground">
            <CheckIcon />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      <Button
        to="/login"
        variant={isHighlighted ? "primary" : "outline"}
        className={buttonClass}
      >
        {plan.cta_label}
      </Button>
    </article>
  );
}
