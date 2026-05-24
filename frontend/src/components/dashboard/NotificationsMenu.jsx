import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

import { fetchCalls } from "../../lib/api";
import { getInitials } from "../../lib/auth";

const SUMMARY_MAX = 90;

function formatRelative(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  if (Number.isNaN(diffMs)) return "";
  if (diffMs < 0) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function hasFlags(call) {
  return Boolean(call?.health_flags && call.health_flags.trim().length > 0);
}

function summarize(call) {
  const text =
    call?.ai_summary?.trim() ||
    call?.notes?.trim() ||
    "No summary available yet.";
  return text.length > SUMMARY_MAX
    ? `${text.slice(0, SUMMARY_MAX).trimEnd()}\u2026`
    : text;
}

function BellIcon() {
  return (
    <svg
      className="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function SkeletonRow() {
  return (
    <li className="flex animate-pulse items-start gap-3 px-4 py-3">
      <div className="size-9 shrink-0 rounded-full bg-foreground/10" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded bg-foreground/10" />
        <div className="h-3 w-full rounded bg-foreground/10" />
        <div className="h-3 w-2/3 rounded bg-foreground/10" />
      </div>
    </li>
  );
}

export default function NotificationsMenu() {
  const [open, setOpen] = useState(false);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const containerRef = useRef(null);

  const loadCalls = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchCalls();
      const list = Array.isArray(data?.calls) ? data.calls : [];
      const sorted = [...list].sort((a, b) => {
        const aTime = a?.started_at ? new Date(a.started_at).getTime() : 0;
        const bTime = b?.started_at ? new Date(b.started_at).getTime() : 0;
        return bTime - aTime;
      });
      setCalls(sorted.slice(0, 3));
    } catch (err) {
      setError(err?.message || "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCalls();
  }, [loadCalls]);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(event) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }
    function onEscape(event) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      document.removeEventListener("keydown", onEscape);
    };
  }, [open]);

  const toggle = () => {
    setOpen((prev) => {
      const next = !prev;
      if (next) loadCalls();
      return next;
    });
  };

  const flaggedCount = calls.filter(hasFlags).length;
  const showDot = flaggedCount > 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={
          showDot
            ? `Notifications, ${flaggedCount} flagged`
            : "Notifications"
        }
        className="relative inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-card text-muted transition-colors hover:text-foreground"
      >
        <BellIcon />
        {showDot && (
          <span className="absolute top-2 right-2 flex size-2.5 items-center justify-center">
            <span className="absolute inline-flex size-2.5 animate-ping rounded-full bg-red-500 opacity-60" />
            <span className="relative inline-flex size-2 rounded-full bg-red-500 ring-2 ring-card" />
          </span>
        )}
      </button>

      <div
        role="menu"
        aria-label="Recent calls"
        className={`absolute right-0 top-full z-50 mt-2 w-80 origin-top-right overflow-hidden rounded-2xl border border-border/60 bg-card shadow-xl shadow-foreground/10 ring-1 ring-border/30 transition-all duration-150 sm:w-96 ${
          open
            ? "translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-1 scale-95 opacity-0"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-foreground">
              Recent calls
            </p>
            <p className="text-xs text-muted">Latest 3 wellness check-ins</p>
          </div>
          <Link
            to="/dashboard/calls"
            onClick={() => setOpen(false)}
            className="text-xs font-semibold text-primary transition-colors hover:underline"
          >
            View all
          </Link>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {loading && (
            <ul className="divide-y divide-border/40">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </ul>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center gap-3 px-4 py-6 text-center">
              <p className="text-sm text-red-600">{error}</p>
              <button
                type="button"
                onClick={loadCalls}
                className="rounded-full border border-border/60 px-3 py-1 text-xs font-semibold text-foreground transition-colors hover:bg-foreground/5"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && calls.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">
              No wellness calls yet. Check back after the next check-in.
            </div>
          )}

          {!loading && !error && calls.length > 0 && (
            <ul className="divide-y divide-border/40">
              {calls.map((call) => {
                const [firstName = "", ...rest] = (
                  call.senior_name || ""
                ).split(" ");
                const initials = getInitials(firstName, rest.join(" "));
                const flagged = hasFlags(call);
                return (
                  <li key={call.id}>
                    <Link
                      to="/dashboard/calls"
                      onClick={() => setOpen(false)}
                      className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-foreground/5"
                    >
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                          flagged
                            ? "bg-amber-100 text-amber-700"
                            : "bg-primary/10 text-primary"
                        }`}
                        aria-hidden
                      >
                        {initials || "?"}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {call.senior_name || "Unknown senior"}
                          </p>
                          <span className="shrink-0 text-[11px] text-muted">
                            {formatRelative(call.started_at)}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                          {summarize(call)}
                        </p>
                        {flagged && (
                          <span className="mt-1.5 inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">
                            Flagged
                          </span>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
