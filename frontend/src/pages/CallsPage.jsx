import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import StatusBadge from "../components/dashboard/StatusBadge";
import AddCallModal from "../components/dashboard/AddCallModal";
import EditCallModal from "../components/dashboard/EditCallModal";
import DeleteCallModal from "../components/dashboard/DeleteCallModal";
import { getInitials } from "../lib/auth";
import { fetchCalls, updateCall } from "../lib/api";

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
  return call.ai_summary || call.notes || "No summary recorded yet.";
}

function isActive(call) {
  return call.status === "initiated" || call.status === "in_progress";
}

function CallCard({ call, onEdit, onDelete, onStatusChange, updatingId }) {
  const [firstName, ...rest] = call.senior_name.split(" ");
  const lastName = rest.join(" ");
  const initials = getInitials(firstName, lastName);
  const busy = updatingId === call.id;

  return (
    <article className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-foreground">
                {call.senior_name}
              </h2>
              <StatusBadge status={call.status} />
              {call.health_flags?.trim() && (
                <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  Flagged
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-muted">
              Started {formatDateTime(call.started_at)}
              {call.ended_at && (
                <> · Ended {formatDateTime(call.ended_at)}</>
              )}
            </p>
            <p className="mt-1 text-xs text-muted">
              Duration {formatDuration(call.duration_seconds)}
            </p>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm leading-relaxed text-muted">{callSummary(call)}</p>

      {call.health_flags?.trim() && (
        <p className="mt-2 rounded-xl bg-amber-50 px-3 py-2 text-sm text-amber-800">
          <span className="font-semibold">Health flags:</span> {call.health_flags}
        </p>
      )}

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border/40 pt-5">
        {isActive(call) && (
          <>
            {call.status === "initiated" && (
              <Button
                type="button"
                variant="outline"
                className="px-3 py-1.5 text-xs"
                disabled={busy}
                onClick={() => onStatusChange(call, "in_progress")}
              >
                {busy ? "Updating…" : "Start call"}
              </Button>
            )}
            <Button
              type="button"
              className="px-3 py-1.5 text-xs"
              disabled={busy}
              onClick={() => onStatusChange(call, "completed")}
            >
              {busy ? "Updating…" : "End call"}
            </Button>
          </>
        )}
        <Button
          type="button"
          variant="outline"
          className="px-3 py-1.5 text-xs"
          onClick={() => onEdit(call)}
        >
          Edit
        </Button>
        <Button
          type="button"
          className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
          onClick={() => onDelete(call)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

export default function CallsPage() {
  const { callsVersion, bumpCalls } = useOutletContext();
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

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
  }, [loadCalls, callsVersion]);

  const stats = useMemo(() => {
    const completed = calls.filter((c) => c.status === "completed").length;
    const active = calls.filter(isActive).length;
    const flagged = calls.filter((c) => c.health_flags?.trim()).length;
    return { total: calls.length, completed, active, flagged };
  }, [calls]);

  function handleMutationSuccess() {
    bumpCalls?.();
  }

  function openEdit(call) {
    setSelectedCall(call);
    setEditOpen(true);
  }

  function openDelete(call) {
    setSelectedCall(call);
    setDeleteOpen(true);
  }

  async function handleStatusChange(call, status) {
    setUpdatingId(call.id);
    try {
      await updateCall(call.id, { status });
      handleMutationSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Wellness calls
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Review check-in history, track active calls, and capture notes or
              health flags from each conversation.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={() => setAddOpen(true)}
          >
            + Log call
          </Button>
        </div>

        {!loading && !error && calls.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted">Total logged</p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-secondary">{stats.completed}</p>
              <p className="text-xs text-muted">Completed</p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">{stats.active}</p>
              <p className="text-xs text-muted">Active now</p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-amber-700">{stats.flagged}</p>
              <p className="text-xs text-muted">With health flags</p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center text-sm text-muted">Loading calls…</p>
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
            No wellness calls yet. Add a senior to your circle, then use
            &quot;+ Log call&quot; to record a check-in.
          </p>
        </div>
      )}

      {!loading && !error && calls.length > 0 && (
        <div className="space-y-4">
          {calls.map((call) => (
            <CallCard
              key={call.id}
              call={call}
              onEdit={openEdit}
              onDelete={openDelete}
              onStatusChange={handleStatusChange}
              updatingId={updatingId}
            />
          ))}
        </div>
      )}

      <AddCallModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <EditCallModal
        open={editOpen}
        call={selectedCall}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <DeleteCallModal
        open={deleteOpen}
        call={selectedCall}
        onClose={() => setDeleteOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </main>
  );
}
