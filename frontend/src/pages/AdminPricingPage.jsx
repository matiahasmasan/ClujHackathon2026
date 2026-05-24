import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import PlanModal from "../components/admin/PlanModal";
import DeletePlanModal from "../components/admin/DeletePlanModal";
import FeatureModal from "../components/admin/FeatureModal";
import {
  PricingPlanListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { deleteFeature, fetchPricing } from "../lib/api";

function IconEdit() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5Z" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function formatPrice(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Plan modals
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [deletePlanTarget, setDeletePlanTarget] = useState(null);

  // Feature modals
  const [featureModal, setFeatureModal] = useState(null); // { planId, feature? }

  function load() {
    setLoading(true);
    setError("");
    fetchPricing()
      .then((data) => setPlans(data.plans))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    plans: plans.length,
    features: plans.reduce((sum, p) => sum + p.features.length, 0),
    highlighted: plans.filter((p) => p.is_highlighted).length,
  }), [plans]);

  function openAddPlan() { setEditPlan(null); setPlanModalOpen(true); }
  function openEditPlan(plan) { setEditPlan(plan); setPlanModalOpen(true); }

  function handlePlanSaved(saved) {
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.id === saved.id);
      if (idx === -1) return [...prev, { ...saved, features: [] }];
      return prev.map((p) => (p.id === saved.id ? { ...saved, features: p.features } : p));
    });
  }

  function handlePlanDeleted(planId) {
    setPlans((prev) => prev.filter((p) => p.id !== planId));
  }

  function handleFeatureSaved(planId, savedFeature) {
    setPlans((prev) =>
      prev.map((p) => {
        if (p.id !== planId) return p;
        const idx = p.features.findIndex((f) => f.id === savedFeature.id);
        const features =
          idx === -1
            ? [...p.features, savedFeature]
            : p.features.map((f) => (f.id === savedFeature.id ? savedFeature : f));
        return { ...p, features: features.sort((a, b) => a.sort_order - b.sort_order) };
      }),
    );
  }

  async function handleDeleteFeature(planId, featureId) {
    try {
      await deleteFeature(featureId);
      setPlans((prev) =>
        prev.map((p) =>
          p.id === planId
            ? { ...p, features: p.features.filter((f) => f.id !== featureId) }
            : p,
        ),
      );
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      {/* Header banner */}
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Pricing</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Manage pricing plans and their features shown on the landing page.
            </p>
          </div>
          <Button type="button" className="shrink-0 px-4 py-2 text-sm" onClick={openAddPlan}>
            + Add plan
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Plans" value={String(stats.plans)} sub="Active pricing tiers" icon="users" />
          <StatCard label="Features" value={String(stats.features)} sub="Across all plans" icon="pill" />
          <StatCard label="Highlighted" value={String(stats.highlighted)} sub="Most Popular plans" icon="alert" />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={3} />
          <PricingPlanListSkeleton rows={3} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="px-4 py-2 text-sm">Retry</Button>
        </div>
      )}

      {!loading && !error && plans.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No plans yet. Use &quot;+ Add plan&quot; to create one.</p>
        </div>
      )}

      {/* Plan cards */}
      {!loading && !error && plans.length > 0 && (
        <ul className="space-y-4">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className="dashboard-card-hover rounded-2xl bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6"
            >
              {/* Plan header */}
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-lg font-bold text-foreground">{plan.name}</h2>
                  {plan.is_highlighted && (
                    <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-white">
                      Most Popular
                    </span>
                  )}
                  <span className="rounded-full bg-black/5 px-2.5 py-0.5 text-xs font-medium text-muted">
                    order {plan.sort_order}
                  </span>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button type="button" variant="outline" className="px-3 py-1.5 text-xs" onClick={() => openEditPlan(plan)}>
                    Edit plan
                  </Button>
                  <Button type="button" className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90" onClick={() => setDeletePlanTarget(plan)}>
                    Delete
                  </Button>
                </div>
              </div>

              {/* Plan details */}
              <dl className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
                {plan.tagline && <dd className="w-full text-foreground/70">{plan.tagline}</dd>}
                <div className="flex gap-1">
                  <dt className="font-medium text-foreground/70">Monthly</dt>
                  <dd>{formatPrice(plan.price_monthly, plan.currency)}</dd>
                </div>
                {plan.price_yearly && (
                  <div className="flex gap-1">
                    <dt className="font-medium text-foreground/70">Yearly</dt>
                    <dd>{formatPrice(plan.price_yearly, plan.currency)}</dd>
                  </div>
                )}
                <div className="flex gap-1">
                  <dt className="font-medium text-foreground/70">CTA</dt>
                  <dd>
                    {plan.cta_label}{" "}
                    <span className="text-muted/70">→ {plan.cta_href}</span>
                  </dd>
                </div>
              </dl>

              {/* Features */}
              <div className="mt-5 border-t border-border/40 pt-5">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Features ({plan.features.length})
                  </p>
                  <button
                    type="button"
                    onClick={() => setFeatureModal({ planId: plan.id, feature: null })}
                    className="text-xs font-semibold text-primary hover:underline"
                  >
                    + Add feature
                  </button>
                </div>

                {plan.features.length === 0 && (
                  <p className="mt-3 text-sm text-muted">No features yet.</p>
                )}

                <ul className="mt-3 space-y-1.5">
                  {plan.features.map((feature) => (
                    <li
                      key={feature.id}
                      className="dashboard-row-hover flex items-center justify-between gap-3 rounded-xl bg-black/[0.02] px-3 py-2"
                    >
                      <span className="text-sm text-foreground">{feature.label}</span>
                      <div className="flex shrink-0 items-center gap-1">
                        <button
                          type="button"
                          onClick={() => setFeatureModal({ planId: plan.id, feature })}
                          className="inline-flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-black/5 hover:text-foreground"
                          aria-label="Edit feature"
                        >
                          <IconEdit />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFeature(plan.id, feature.id)}
                          className="inline-flex size-7 items-center justify-center rounded-lg text-muted transition-colors hover:bg-red-50 hover:text-red-600"
                          aria-label="Delete feature"
                        >
                          <IconTrash />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PlanModal
        open={planModalOpen}
        plan={editPlan}
        onClose={() => setPlanModalOpen(false)}
        onSuccess={handlePlanSaved}
      />

      <DeletePlanModal
        open={deletePlanTarget !== null}
        plan={deletePlanTarget}
        onClose={() => setDeletePlanTarget(null)}
        onSuccess={() => handlePlanDeleted(deletePlanTarget?.id)}
      />

      <FeatureModal
        open={featureModal !== null}
        planId={featureModal?.planId}
        feature={featureModal?.feature}
        onClose={() => setFeatureModal(null)}
        onSuccess={(saved) => handleFeatureSaved(featureModal?.planId, saved)}
      />
    </main>
  );
}
