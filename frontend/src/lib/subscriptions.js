const ACTIVE_STATUSES = new Set(["active", "trialing"]);

export function isActiveSubscription(subscription) {
  const status = String(subscription?.status ?? "").toLowerCase();
  return ACTIVE_STATUSES.has(status);
}

export function canCancelSubscription(subscription) {
  if (!subscription || subscription.cancel_at_period_end) return false;
  const status = String(subscription.status ?? "").toLowerCase();
  return !["canceled", "cancelled", "unpaid", "incomplete_expired"].includes(status);
}

export function formatSubscriptionDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatPlanPrice(price, currency = "USD") {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return "—";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency || "USD"}`;
  }
}

export function sumMonthlyRevenue(subscriptions) {
  return subscriptions.reduce((sum, subscription) => {
    if (!isActiveSubscription(subscription)) return sum;
    return sum + Number(subscription?.plan_price_monthly ?? 0);
  }, 0);
}
