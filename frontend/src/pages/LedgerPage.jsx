import { useEffect, useMemo, useState } from "react";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import {
  ACTION_LABELS,
  appendLedger,
  loadLedger,
  seedLedger,
  tamperLedger,
  verifyLedger,
} from "../lib/ledger";

const SAMPLE_EVENTS = [
  { senior: "Ion Pop", medication: "Aspirin", dose: "100mg" },
  { senior: "Maria Ene", medication: "Metformin", dose: "500mg" },
  { senior: "Gheorghe Radu", medication: "Atorvastatin", dose: "20mg" },
  { senior: "Ana Dumitru", medication: "Lisinopril", dose: "10mg" },
];

function short(hash) {
  return `${hash.slice(0, 10)}…${hash.slice(-6)}`;
}

function formatTime(iso) {
  return new Date(iso).toLocaleString();
}

export default function LedgerPage() {
  const [entries, setEntries] = useState(loadLedger);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (loadLedger().length === 0) {
      seedLedger().then(setEntries);
    }
  }, []);

  const stats = useMemo(() => {
    const last = entries[entries.length - 1];
    return {
      total: entries.length,
      lastEntry: last ? formatTime(last.createdAt) : "—",
      integrity:
        result === null
          ? "Unverified"
          : result.valid
            ? "Verified ✓"
            : "Tampered ✗",
    };
  }, [entries, result]);

  async function handleVerify() {
    setBusy(true);
    const res = await verifyLedger();
    setResult(res);
    setBusy(false);
  }

  async function handleAddEvent() {
    const sample =
      SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
    const time = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const next = await appendLedger({
      actor: "Dr. Elena Marin",
      action: "medication.taken",
      payload: { ...sample, time },
    });
    setEntries(next);
    setResult(null);
  }

  function handleTamper() {
    if (entries.length === 0) return;
    tamperLedger(entries[0].id, { dose: "999mg (altered)" });
    setEntries(loadLedger());
    setResult(null);
  }

  async function handleReset() {
    setEntries(await seedLedger());
    setResult(null);
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      {/* Hero banner */}
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Care Ledger
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              A tamper-evident, append-only record of care events. Each entry is
              cryptographically chained to the one before it — any past edit or
              deletion is immediately detectable.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={handleAddEvent}
          >
            + Log event
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total events"
          value={String(stats.total)}
          sub="Entries in the chain"
          icon="alert"
        />
        <StatCard
          label="Last entry"
          value={entries.length > 0 ? String(entries.length) : "—"}
          sub={stats.lastEntry}
          icon="phone"
        />
        <StatCard
          label="Chain integrity"
          value={result === null ? "—" : result.valid ? "OK" : "Broken"}
          sub={stats.integrity}
          icon={result !== null && !result.valid ? "alert" : "users"}
        />
      </div>

      {/* Action strip */}
      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          onClick={handleVerify}
          disabled={busy}
          className="px-4 py-2 text-sm"
        >
          {busy ? "Verifying…" : "Verify integrity"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          className="px-4 py-2 text-sm"
        >
          Reset ledger
        </Button>
      </div>

      {/* Verify result banner */}
      {result && (
        <div
          className={`rounded-2xl border px-5 py-4 text-sm font-medium ${
            result.valid
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {result.valid
            ? "✓ Chain verified — all records are intact and unaltered."
            : `⚠ Tampering detected — the chain breaks at entry #${result.brokenAt}. A past record was edited or removed.`}
        </div>
      )}

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="rounded-2xl bg-card/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No events yet. Use &quot;+ Log event&quot; to record the first
            entry.
          </p>
        </div>
      )}

      {/* Chain entries */}
      {entries.length > 0 && (
        <section className="rounded-2xl bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-bold text-foreground">Event chain</h2>

          <ol className="mt-4 space-y-3">
            {entries.map((entry, index) => {
              const isBroken =
                result && !result.valid && entry.id === result.brokenAt;
              return (
                <li
                  key={entry.id}
                  className={`rounded-xl border border-border/40 p-4 transition-colors ${
                    isBroken ? "border-red-300 bg-red-50" : "bg-surface/50"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                        {entry.id}
                      </span>
                      <div>
                        <p className="font-semibold text-foreground">
                          {ACTION_LABELS[entry.action] ?? entry.action}
                        </p>
                        <p className="text-xs text-muted">
                          {entry.actor} · {formatTime(entry.createdAt)}
                        </p>
                      </div>
                    </div>
                    {index === 0 && (
                      <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                        genesis
                      </span>
                    )}
                    {isBroken && (
                      <span className="rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-600">
                        tampered
                      </span>
                    )}
                  </div>

                  <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {Object.entries(entry.payload).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <dt className="text-muted">{key}:</dt>
                        <dd className="font-medium text-foreground">
                          {String(value)}
                        </dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-3 space-y-0.5 border-t border-border/40 pt-3 font-mono text-xs text-muted">
                    <p>
                      prev:{" "}
                      <span className="text-foreground/70">
                        {short(entry.prevHash)}
                      </span>
                    </p>
                    <p>
                      hash:{" "}
                      <span className="text-foreground/70">
                        {short(entry.hash)}
                      </span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}
    </main>
  );
}
