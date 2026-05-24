import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/dashboard/StatusBadge";
import {
  CallCardListSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { getInitials } from "../lib/auth";
import { fetchCalls } from "../lib/api";

function healthFlagsFromJson(raw) {
  if (!raw?.trim()) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [raw];
  } catch {
    return raw
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function formatDateTime(iso) {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDuration(seconds) {
  if (seconds == null) return "—";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function callSummary(call) {
  return call.ai_summary || call.notes || "No summary yet.";
}

function isActive(call) {
  return (
    call.status === "initiated" ||
    call.status === "ongoing" ||
    call.status === "in_progress"
  );
}

function CallCard({ call }) {
  const [firstName, ...rest] = call.senior_name.split(" ");
  const lastName = rest.join(" ");
  const initials = getInitials(firstName, lastName);
  const flags = healthFlagsFromJson(call.health_flags);

  return (
    <article className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <div className="flex min-w-0 items-start gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-lg font-bold text-foreground">
              {call.senior_name}
            </h2>
            <StatusBadge status={call.status} />
            {flags.length > 0 && (
              <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                Flagged
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-muted">
            Started {formatDateTime(call.started_at)}
            {call.ended_at && <> · Ended {formatDateTime(call.ended_at)}</>}
          </p>
          <p className="mt-1 text-xs text-muted">
            Duration {formatDuration(call.duration_seconds)}
          </p>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{callSummary(call)}</p>

      {flags.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {flags.map((flag) => (
            <span
              key={flag}
              className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800"
            >
              {flag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}

export default function CallsPage() {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  const loadCalls = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCalls();
      setCalls(data.calls);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return calls;
    return calls.filter(
      (c) =>
        c.senior_name.toLowerCase().includes(q) ||
        callSummary(c).toLowerCase().includes(q) ||
        c.status.toLowerCase().includes(q),
    );
  }, [calls, query]);

  const stats = useMemo(() => {
    const completed = calls.filter((c) => c.status === "completed").length;
    const active = calls.filter(isActive).length;
    const flagged = calls.filter((c) => c.health_flags?.trim()).length;
    return { total: calls.length, completed, active, flagged };
  }, [calls]);

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
          Wellness calls
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Automated check-in history for your care circle. Calls are placed by
          the system — review summaries and health flags here.
        </p>

        <label className="relative mt-2 block">
          <span className="sr-only">Search calls</span>
          <svg className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by senior, status, or summary…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-white/70 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Wellness calls"
            value={String(stats.total)}
            sub="Total in history"
            icon="phone"
          />
          <StatCard
            label="Completed"
            value={String(stats.completed)}
            sub="Finished check-ins"
            icon="phone"
          />
          <StatCard
            label="In progress"
            value={String(stats.active)}
            sub="Active or scheduled"
            icon="phone"
          />
          <StatCard
            label="Health flags"
            value={String(stats.flagged)}
            sub="Need your attention"
            icon="alert"
          />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={4} />
          <CallCardListSkeleton rows={3} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={loadCalls} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && calls.length === 0 && (
        <div className="rounded-2xl bg-white/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No wellness calls yet. Once automated check-ins run for seniors in
            your circle, they will appear here.
          </p>
        </div>
      )}

      {!loading && !error && calls.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-white/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No calls match &quot;{query}&quot;.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((call) => (
            <CallCard key={call.id} call={call} />
          ))}
        </div>
      )}
    </main>
  );
}
