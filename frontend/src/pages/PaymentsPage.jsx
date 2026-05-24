import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import PaymentStatusBadge from "../components/payments/PaymentStatusBadge";
import {
  ListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { fetchPayments } from "../lib/api";
import { formatPaymentAmount, formatPaymentDate, isPaidPayment, sumPaymentAmounts } from "../lib/payments";

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function load() {
    setLoading(true);
    setError("");
    fetchPayments()
      .then((data) => setPayments(Array.isArray(data?.payments) ? data.payments : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const paid = payments.filter(isPaidPayment);
    const totalPaid = sumPaymentAmounts(paid);
    const currency = paid[0]?.currency ?? payments[0]?.currency ?? "USD";
    return {
      total: payments.length,
      succeeded: paid.length,
      totalPaid: formatPaymentAmount(totalPaid, currency),
    };
  }, [payments]);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Payments</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Your subscription and billing history. Contact support if you have questions about a charge.
          </p>
        </div>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total payments" value={String(stats.total)} sub="All billing records" icon="users" />
          <StatCard label="Successful" value={String(stats.succeeded)} sub="Completed charges" icon="phone" />
          <StatCard label="Total paid" value={stats.totalPaid} sub="Lifetime payments" icon="pill" />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={3} />
          <ListSkeleton rows={4} />
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

      {!loading && !error && payments.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm backdrop-blur-sm">
          <p className="text-sm text-muted">No payments yet. Your billing history will appear here.</p>
        </div>
      )}

      {!loading && !error && payments.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {payments.map((payment) => (
            <li
              key={payment.id}
              className="dashboard-row-hover flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-lg font-semibold text-foreground">
                    {formatPaymentAmount(payment.amount, payment.currency)}
                  </p>
                  <PaymentStatusBadge status={payment.status} />
                </div>
                <p className="mt-1 text-xs text-muted">
                  Created {formatPaymentDate(payment.created_at)}
                </p>
                {payment.paid_at && (
                  <p className="mt-1 text-xs text-muted">Paid {formatPaymentDate(payment.paid_at)}</p>
                )}
                {payment.failed_at && (
                  <p className="mt-1 text-xs text-red-600">
                    Failed {formatPaymentDate(payment.failed_at)}
                    {payment.failure_reason ? ` — ${payment.failure_reason}` : ""}
                  </p>
                )}
                {payment.stripe_invoice_id && (
                  <p className="mt-2 text-xs text-muted">
                    Invoice: <span className="font-mono">{payment.stripe_invoice_id}</span>
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
