import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import PaymentModal from "../components/admin/PaymentModal";
import DeletePaymentModal from "../components/admin/DeletePaymentModal";
import PaymentStatusBadge from "../components/payments/PaymentStatusBadge";
import { fetchAllPayments, fetchUsers } from "../lib/api";
import { getInitials } from "../lib/auth";
import { formatPaymentAmount, formatPaymentDate, isPaidPayment, sumPaymentAmounts } from "../lib/payments";
import {
  ListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  function load() {
    setLoading(true);
    setError("");
    Promise.all([fetchAllPayments(), fetchUsers()])
      .then(([paymentsData, usersData]) => {
        setPayments(Array.isArray(paymentsData?.payments) ? paymentsData.payments : []);
        setUsers(Array.isArray(usersData?.users) ? usersData.users : []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  const stats = useMemo(() => {
    const paid = payments.filter(isPaidPayment);
    const totalRevenue = sumPaymentAmounts(paid);
    const currency = paid[0]?.currency ?? payments[0]?.currency ?? "USD";
    return {
      total: payments.length,
      succeeded: paid.length,
      revenue: formatPaymentAmount(totalRevenue, currency),
    };
  }, [payments]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return payments;
    return payments.filter(
      (p) =>
        `${p.user_first_name} ${p.user_last_name}`.toLowerCase().includes(q) ||
        p.user_email.toLowerCase().includes(q) ||
        p.status.toLowerCase().includes(q) ||
        p.stripe_payment_intent_id?.toLowerCase().includes(q) ||
        p.stripe_invoice_id?.toLowerCase().includes(q),
    );
  }, [payments, query]);

  function handleSaved() {
    fetchAllPayments()
      .then((data) => setPayments(Array.isArray(data?.payments) ? data.payments : []))
      .catch(() => {});
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Payments</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Manage billing records across all caregivers. Add, edit, or remove payment entries.
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
            + Add payment
          </Button>
        </div>

        <label className="relative mt-4 block">
          <span className="sr-only">Search payments</span>
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
            placeholder="Search by name, email, status, or Stripe ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-card/75 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total payments" value={String(stats.total)} sub="All records" icon="users" />
          <StatCard label="Successful" value={String(stats.succeeded)} sub="Completed charges" icon="phone" />
          <StatCard label="Revenue" value={stats.revenue} sub="From successful payments" icon="ledger" />
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

      {!loading && !error && payments.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No payment records yet. Use &quot;+ Add payment&quot; to create one.</p>
        </div>
      )}

      {!loading && !error && payments.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No payments match &quot;{query}&quot;.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-card/75 shadow-sm backdrop-blur-sm">
          {filtered.map((payment) => (
            <li
              key={payment.id}
              className="dashboard-row-hover flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {getInitials(payment.user_first_name, payment.user_last_name)}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">
                      {formatPaymentAmount(payment.amount, payment.currency)}
                    </p>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <p className="text-xs text-muted">
                    {payment.user_first_name} {payment.user_last_name} · {payment.user_email}
                  </p>
                  <p className="mt-1 text-xs text-muted">
                    Created {formatPaymentDate(payment.created_at)}
                  </p>
                  {payment.paid_at && (
                    <p className="mt-1 text-xs text-muted">Paid {formatPaymentDate(payment.paid_at)}</p>
                  )}
                  {payment.stripe_invoice_id && (
                    <p className="mt-1 text-xs font-mono text-muted">{payment.stripe_invoice_id}</p>
                  )}
                  {payment.failure_reason && (
                    <p className="mt-1 text-xs text-red-600">{payment.failure_reason}</p>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="px-3 py-1.5 text-xs"
                  onClick={() => {
                    setEditTarget(payment);
                    setModalOpen(true);
                  }}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                  onClick={() => setDeleteTarget(payment)}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <PaymentModal
        open={modalOpen}
        payment={editTarget}
        users={users}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
        onSuccess={handleSaved}
      />

      <DeletePaymentModal
        open={deleteTarget !== null}
        payment={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onSuccess={() =>
          setPayments((prev) => prev.filter((p) => p.id !== deleteTarget?.id))
        }
      />
    </main>
  );
}
