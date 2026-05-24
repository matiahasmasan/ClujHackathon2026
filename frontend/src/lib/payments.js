const PAID_STATUSES = new Set(["succeeded", "paid", "complete", "completed"]);

export function isPaidPayment(payment) {
  const status = String(payment?.status ?? "").toLowerCase();
  return PAID_STATUSES.has(status) || Boolean(payment?.paid_at);
}

export function sumPaymentAmounts(payments) {
  return payments.reduce((sum, payment) => sum + Number(payment?.amount ?? 0), 0);
}

export function formatPaymentAmount(amount, currency = "USD") {
  const cents = Number(amount);
  if (!Number.isFinite(cents)) return "—";

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(cents / 100);
  } catch {
    return `${(cents / 100).toFixed(2)} ${currency || "USD"}`;
  }
}

export function formatPaymentDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
