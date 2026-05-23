import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import AddSeniorModal from "../components/dashboard/AddSeniorModal";
import EditSeniorModal from "../components/dashboard/EditSeniorModal";
import DeleteSeniorModal from "../components/dashboard/DeleteSeniorModal";
import { getInitials } from "../lib/auth";
import { fetchSeniors } from "../lib/api";

function SeniorCard({ senior, onEdit, onDelete }) {
  const name = `${senior.first_name} ${senior.last_name}`;
  const initials = getInitials(senior.first_name, senior.last_name);

  return (
    <article className="flex flex-col rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold text-foreground">{name}</h2>
          <p className="mt-0.5 text-xs text-muted">ID {senior.id}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground">
              {senior.age} yrs
            </span>
            <span className="rounded-full bg-surface px-2.5 py-0.5 text-xs font-medium text-foreground">
              {senior.gender}
            </span>
          </div>
        </div>
      </div>

      <dl className="mt-5 space-y-3 border-t border-border/40 pt-5 text-sm">
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
            Phone
          </dt>
          <dd className="mt-0.5">
            <a
              href={`tel:${senior.phone_number}`}
              className="font-medium text-primary hover:underline"
            >
              {senior.phone_number}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wide text-muted uppercase">
            Diagnoses
          </dt>
          <dd className="mt-0.5 line-clamp-3 text-foreground">
            {senior.diagnoses || "—"}
          </dd>
        </div>
      </dl>

      <div className="mt-5 flex flex-wrap gap-2 border-t border-border/40 pt-5">
        <Button
          type="button"
          variant="outline"
          className="flex-1 px-4 py-2 text-sm sm:flex-none"
          onClick={() => onEdit(senior)}
        >
          Edit
        </Button>
        <Button
          type="button"
          className="flex-1 bg-red-600 px-4 py-2 text-sm hover:bg-red-600/90 sm:flex-none"
          onClick={() => onDelete(senior)}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}

export default function SeniorsPage() {
  const { seniorsVersion, bumpSeniors } = useOutletContext();
  const [seniors, setSeniors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSenior, setSelectedSenior] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadSeniors = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchSeniors();
      setSeniors(data.seniors);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSeniors();
  }, [loadSeniors, seniorsVersion]);

  const stats = useMemo(() => {
    const withDiagnoses = seniors.filter((s) => s.diagnoses?.trim()).length;
    return { total: seniors.length, withDiagnoses };
  }, [seniors]);

  function openEdit(senior) {
    setSelectedSenior(senior);
    setEditOpen(true);
  }

  function openDelete(senior) {
    setSelectedSenior(senior);
    setDeleteOpen(true);
  }

  function handleMutationSuccess() {
    bumpSeniors?.();
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Seniors
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Everyone in your care circle. Update details or remove someone when
              they leave your care.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={() => setAddOpen(true)}
          >
            + Add senior
          </Button>
        </div>

        {!loading && !error && seniors.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">
                {stats.total}
              </p>
              <p className="text-xs text-muted">In your circle</p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">
                {stats.withDiagnoses}
              </p>
              <p className="text-xs text-muted">With diagnoses on file</p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center text-sm text-muted">Loading seniors…</p>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={loadSeniors} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && seniors.length === 0 && (
        <div className="rounded-2xl bg-white/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No seniors yet. Use &quot;+ Add senior&quot; above to add someone to
            your circle.
          </p>
        </div>
      )}

      {!loading && !error && seniors.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {seniors.map((senior) => (
            <SeniorCard
              key={senior.id}
              senior={senior}
              onEdit={openEdit}
              onDelete={openDelete}
            />
          ))}
        </div>
      )}

      <AddSeniorModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <EditSeniorModal
        open={editOpen}
        senior={selectedSenior}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <DeleteSeniorModal
        open={deleteOpen}
        senior={selectedSenior}
        onClose={() => setDeleteOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </main>
  );
}
