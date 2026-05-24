import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import SubscriptionModal from "../components/admin/SubscriptionModal";
import DeleteSubscriptionModal from "../components/admin/DeleteSubscriptionModal";
import SubscriptionStatusBadge from "../components/subscriptions/SubscriptionStatusBadge";
import { fetchAllSubscriptions, fetchPricing, fetchUsers } from "../lib/api";
import { getInitials } from "../lib/auth";
import {
  formatPlanPrice,
  formatSubscriptionDate,
  isActiveSubscription,
  sumMonthlyRevenue,
} from "../lib/subscriptions";
import {
  ListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([fetchAllSubscriptions(), fetchUsers(), fetchPricing()])
      .then(([subsData, usersData, pricingData]) => {
        setSubscriptions(Array.isArray(subsData?.subscriptions) ? subsData.subscriptions : []);
        setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
        setPlans(Array.isArray(pricingData?.plans) ? pricingData.plans : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const active = subscriptions.filter(isActiveSubscription);
    const canceling = subscriptions.filter((s) => s.cancel_at_period_end);
    const currency = active[0]?.plan_currency ?? subscriptions[0]?.plan_currency ?? "USD";
    return {
      total: subscriptions.length,
      active: active.length,
      canceling: canceling.length,
      mrr: formatPlanPrice(sumMonthlyRevenue(subscriptions), currency),
    };
  }, [subscriptions]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return subscriptions;
    return subscriptions.filter(
      (s) =>
        `${s.user_first_name} ${s.user_last_name}`.toLowerCase().includes(q) ||
        s.user_email.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q) ||
        s.plan_name?.toLowerCase().includes(q) ||
        s.stripe_customer_id?.toLowerCase().includes(q) ||
        s.stripe_subscription_id?.toLowerCase().includes(q),
    );
  }, [subscriptions, query]);

  function handleSaved() {
    fetchAllSubscriptions()
      .then((data) =>
        setSubscriptions(Array.isArray(data?.subscriptions) ? data.subscriptions : []),
      )
      .catch(() => {});
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Subscriptions</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Manage caregiver subscriptions and billing periods across all plans.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={() => {
              setEditTarget(null);
              setModalOpen(true);
            }}
          >
            + Add subscription
          </Button>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">Search subscriptions</span>
          <svg
            className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, email, plan, status, or Stripe ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/75 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total subscriptions" value={String(stats.total)} sub="All records" icon="users" />
          <StatCard label="Active" value={String(stats.active)} sub="Active or trialing" icon="phone" />
          <StatCard label="Monthly revenue" value={stats.mrr} sub="From active subscriptions" icon="ledger" />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={3} />
          <ListSkeleton rows={4} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && subscriptions.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No subscriptions yet. Use &quot;+ Add subscription&quot; to create one.
          </p>
        </div>
      )}

      {!loading && !error && subscriptions.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No subscriptions match &quot;{query}&quot;.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {filtered.map((subscription) => (
            <li
              key={subscription.id}
              className="dashboard-row-hover flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(subscription.user_first_name, subscription.user_last_name)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {subscription.plan_name ?? `Plan #${subscription.plan_id}`}
                    </p>
                    <SubscriptionStatusBadge status={subscription.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {subscription.user_first_name} {subscription.user_last_name} · {subscription.user_email}
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    {formatPlanPrice(subscription.plan_price_monthly, subscription.plan_currency)} / month
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Renews {formatSubscriptionDate(subscription.current_period_end)}
                  </p>
                  {subscription.cancel_at_period_end && (
                    <p className="mt-1 text-xs text-yellow-700">Canceling at period end</p>
                  )}
                  <p className="mt-1 text-xs font-mono text-muted">
                    {subscription.stripe_subscription_id}
                  </p>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => {
                    setEditTarget(subscription);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                  onClick={() => setDeleteTarget(subscription)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <SubscriptionModal
        open={modalOpen}
        subscription={editTarget}
        users={users}
        plans={plans}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSuccess={handleSaved}
      />

      <DeleteSubscriptionModal
        open={deleteTarget !== null}
        subscription={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() =>
          setSubscriptions((prev) => prev.filter((s) => s.id !== deleteTarget?.id))
        }
      />
    </main>
  );
}
