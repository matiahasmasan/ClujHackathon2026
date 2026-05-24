import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import CancelSubscriptionModal from "../components/dashboard/CancelSubscriptionModal";
import SubscriptionStatusBadge from "../components/subscriptions/SubscriptionStatusBadge";
import {
  ListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { fetchSubscriptions } from "../lib/api";
import {
  canCancelSubscription,
  formatPlanPrice,
  formatSubscriptionDate,
  isActiveSubscription,
} from "../lib/subscriptions";

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelTarget, setCancelTarget] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    fetchSubscriptions()
      .then((data) =>
        setSubscriptions(Array.isArray(data?.subscriptions) ? data.subscriptions : []),
      )
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const active = subscriptions.filter(isActiveSubscription);
    const current = subscriptions[0];
    return {
      total: subscriptions.length,
      active: active.length,
      planName: current?.plan_name ?? "—",
      monthlyPrice: current
        ? formatPlanPrice(current.plan_price_monthly, current.plan_currency)
        : "—",
    };
  }, [subscriptions]);

  const hasCancelable = subscriptions.some(canCancelSubscription);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Subscriptions</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Your current plan and billing period. You can cancel anytime — access continues until the period ends.
            </p>
          </div>
          {hasCancelable && (
            <Button
              type="button"
              className="shrink-0 bg-red-600 px-4 py-2 text-sm hover:bg-red-600/90"
              onClick={() => setCancelTarget(subscriptions.find(canCancelSubscription))}
            >
              Cancel subscription
            </Button>
          )}
        </div>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Current plan" value={stats.planName} sub="Your active tier" icon="users" />
          <StatCard label="Active" value={String(stats.active)} sub="Active subscriptions" icon="phone" />
          <StatCard label="Monthly price" value={stats.monthlyPrice} sub="Billed each month" icon="pill" />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={3} />
          <ListSkeleton rows={3} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-card/75 p-6 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={load} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && subscriptions.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm text-muted">No subscription yet. Choose a plan to get started.</p>
          <Button to="/#pricing" className="mt-4 px-5 py-2 text-sm">
            View plans
          </Button>
        </div>
      )}

      {!loading && !error && subscriptions.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {subscriptions.map((subscription) => (
            <li
              key={subscription.id}
              className="dashboard-row-hover flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">
                    {subscription.plan_name ?? `Plan #${subscription.plan_id}`}
                  </p>
                  <SubscriptionStatusBadge status={subscription.status} />
                </div>
                <p className="mt-1 text-sm text-muted">
                  {formatPlanPrice(subscription.plan_price_monthly, subscription.plan_currency)} / month
                </p>
                <p className="mt-1 text-xs text-muted">
                  Period {formatSubscriptionDate(subscription.current_period_start)} –{" "}
                  {formatSubscriptionDate(subscription.current_period_end)}
                </p>
                {subscription.cancel_at_period_end && (
                  <p className="mt-1 text-xs text-yellow-700">Cancels at end of current period</p>
                )}
                {subscription.canceled_at && (
                  <p className="mt-1 text-xs text-muted">
                    Canceled {formatSubscriptionDate(subscription.canceled_at)}
                  </p>
                )}
                <p className="mt-2 text-xs font-mono text-muted">
                  {subscription.stripe_subscription_id}
                </p>
              </div>

              {canCancelSubscription(subscription) && (
                <Button
                  type="button"
                  className="shrink-0 bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                  onClick={() => setCancelTarget(subscription)}
                >
                  Cancel
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}

      <CancelSubscriptionModal
        open={cancelTarget !== null}
        subscription={cancelTarget}
        onClose={() => setCancelTarget(null)}
        onSuccess={(updated) =>
          setSubscriptions((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
        }
      />
    </main>
  );
}
