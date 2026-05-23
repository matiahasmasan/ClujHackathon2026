import { useEffect, useState } from "react";
import Button from "../components/ui/Button";
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
    // Seed a few demo events the first time the ledger is opened.
    if (loadLedger().length === 0) {
      seedLedger().then(setEntries);
    }
  }, []);

  const handleVerify = async () => {
    setBusy(true);
    const res = await verifyLedger();
    setResult(res);
    setBusy(false);
  };

  const handleAddEvent = async () => {
    const sample = SAMPLE_EVENTS[Math.floor(Math.random() * SAMPLE_EVENTS.length)];
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
  };

  const handleTamper = () => {
    if (entries.length === 0) return;
    // Quietly rewrite the first entry's dose without fixing its hash.
    tamperLedger(entries[0].id, { dose: "999mg (altered)" });
    setEntries(loadLedger());
    setResult(null);
  };

  const handleReset = async () => {
    setEntries(await seedLedger());
    setResult(null);
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-foreground">Care Ledger</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          A tamper-evident, append-only record of important care events. Each
          entry is cryptographically chained to the one before it, so any edit
          or deletion to past records is immediately detectable.
        </p>
      </header>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleVerify} disabled={busy}>
          {busy ? "Verifying…" : "Verify integrity"}
        </Button>
        <Button variant="outline" onClick={handleAddEvent}>
          Log medication taken
        </Button>
        <Button
          variant="outline"
          onClick={handleTamper}
          className="border-red-200 text-red-600 hover:bg-red-50"
        >
          Tamper (demo)
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset ledger
        </Button>
      </div>

      {/* Verify result */}
      {result && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm font-medium ${
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

      {/* Chain */}
      <ol className="space-y-3">
        {entries.map((entry, index) => {
          const isBroken = result && !result.valid && entry.id === result.brokenAt;
          return (
            <li
              key={entry.id}
              className={`rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm ${
                isBroken ? "ring-2 ring-red-400" : ""
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
                  <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-medium text-muted">
                    genesis
                  </span>
                )}
              </div>

              <dl className="mt-3 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                {Object.entries(entry.payload).map(([key, value]) => (
                  <div key={key} className="flex gap-2">
                    <dt className="text-muted">{key}:</dt>
                    <dd className="font-medium text-foreground">{String(value)}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-3 space-y-0.5 border-t border-border/40 pt-3 font-mono text-xs text-muted">
                <p>
                  prev: <span className="text-foreground/70">{short(entry.prevHash)}</span>
                </p>
                <p>
                  hash: <span className="text-foreground/70">{short(entry.hash)}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
