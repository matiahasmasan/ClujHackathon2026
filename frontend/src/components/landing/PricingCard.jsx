import Button from "../ui/Button";

function CheckIcon() {
  return (
    <svg
      className="mt-0.5 size-4 shrink-0 text-secondary transition-transform duration-300 group-hover:scale-110"
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
  const buttonClass = "mt-8 w-full py-2.5 text-sm transition-all duration-300";

  return (
    <article
      className={`group relative flex flex-col rounded-2xl p-6 transition-all duration-300 ease-out sm:p-8 ${
        isHighlighted
          ? "z-10 bg-card shadow-xl shadow-primary/15 ring-2 ring-primary/20 hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary/25 hover:ring-primary/40 motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100"
          : "bg-card/75 shadow-sm backdrop-blur-sm hover:-translate-y-2 hover:scale-[1.02] hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/20 motion-reduce:hover:translate-y-0 motion-reduce:hover:scale-100 dark:hover:shadow-lg dark:hover:shadow-none dark:hover:ring-primary/15"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300 ${
          isHighlighted
            ? "opacity-60 group-hover:opacity-100"
            : "opacity-0 group-hover:opacity-100"
        }`}
      />

      {isHighlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-transform duration-300 group-hover:scale-105">
          Most Popular
        </span>
      )}

      <h3 className="text-xl font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
        {plan.name}
      </h3>
      <p className="mt-1 text-sm text-muted">{plan.tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="origin-left text-4xl font-bold tracking-tight text-foreground transition-transform duration-300 group-hover:scale-105">
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
          <li
            key={feature.id}
            className="flex items-start gap-2.5 text-sm text-foreground transition-transform duration-300 group-hover:translate-x-0.5"
          >
            <CheckIcon />
            <span>{feature.label}</span>
          </li>
        ))}
      </ul>

      <Button
        to="/login"
        variant={isHighlighted ? "primary" : "outline"}
        className={
          isHighlighted
            ? `${buttonClass} group-hover:-translate-y-0.5 group-hover:shadow-lg group-hover:shadow-primary/30`
            : `${buttonClass} group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-md group-hover:shadow-primary/20`
        }
      >
        {plan.cta_label}
      </Button>
    </article>
  );
}
