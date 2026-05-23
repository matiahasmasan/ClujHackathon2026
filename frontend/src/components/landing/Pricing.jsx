import { useEffect, useState } from "react";
import { fetchPricing } from "../../lib/api";
import PricingCard from "./PricingCard";

function CardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col rounded-2xl bg-white/75 p-6 sm:p-8">
      <div className="h-6 w-24 rounded bg-border" />
      <div className="mt-1 h-4 w-48 rounded bg-border" />
      <div className="mt-5 h-10 w-32 rounded bg-border" />
      <div className="mt-6 space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-4 rounded bg-border" />
        ))}
      </div>
      <div className="mt-8 h-10 rounded-full bg-border" />
    </div>
  );
}

export default function Pricing() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetchPricing()
      .then((data) => {
        if (!cancelled) setPlans(data.plans);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (loading || window.location.hash !== "#pricing") return;

    const target = document.getElementById("pricing");
    if (!target) return;

    requestAnimationFrame(() => {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [loading]);

  return (
    <section className="px-4 py-14 sm:px-6 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-6xl">
        <div
          id="pricing"
          className="mx-auto mb-10 max-w-2xl text-center sm:mb-14"
        >
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
            Choose the plan that fits your family. Every tier includes our core
            wellness check-ins and caregiver alerts.
          </p>
        </div>

        {error && (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700">
            {error}
          </p>
        )}

        <div className="grid items-stretch gap-6 pt-3 md:grid-cols-3 lg:gap-8">
          {loading
            ? Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)
            : plans.map((plan) => <PricingCard key={plan.id} plan={plan} />)}
        </div>
      </div>
    </section>
  );
}
