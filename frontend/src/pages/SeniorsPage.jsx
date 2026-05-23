import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
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
          <p className="mt-0.5 text-xs text-muted">Gender {senior.gender}</p>
          <p className="mt-0.5 text-xs text-muted">Age {senior.age} yrs</p>
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

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return seniors;
    return seniors.filter(
      (s) =>
        `${s.first_name} ${s.last_name}`.toLowerCase().includes(q) ||
        s.phone_number?.toLowerCase().includes(q) ||
        s.diagnoses?.toLowerCase().includes(q),
    );
  }, [seniors, query]);

  const stats = useMemo(() => ({
    total: seniors.length,
    withDiagnoses: seniors.filter((s) => s.diagnoses).length,
  }), [seniors]);

  function handleMutationSuccess() {
    bumpSeniors?.();
  }

  function openEdit(senior) {
    setSelectedSenior(senior);
    setEditOpen(true);
  }

  function openDelete(senior) {
    setSelectedSenior(senior);
    setDeleteOpen(true);
  }

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

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Seniors
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Everyone in your care circle. Update details or remove someone
              when they leave your care.
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

        <label className="relative mt-2 block">
          <span className="sr-only">Search seniors</span>
          <svg className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by name, diagnosis, or phone…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-white/70 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Seniors in care"
            value={String(stats.total)}
            sub="Active in your circle"
            icon="users"
          />
          <StatCard
            label="With diagnoses"
            value={String(stats.withDiagnoses)}
            sub="Health info on file"
            icon="alert"
          />
        </div>
      )}

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

      {!loading && !error && seniors.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-white/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No seniors match &quot;{query}&quot;.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <ul className="divide-y divide-border/50 rounded-2xl bg-white/75 shadow-sm backdrop-blur-sm">
          {filtered.map((senior) => {
            const name = `${senior.first_name} ${senior.last_name}`;
            return (
              <li
                key={senior.id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex items-start gap-3">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {getInitials(senior.first_name, senior.last_name)}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{name}</p>
                    <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">Age</dt>
                        <dd>{senior.age}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">
                          Gender
                        </dt>
                        <dd>{senior.gender}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt className="font-medium text-foreground/70">
                          Phone
                        </dt>
                        <dd>{senior.phone_number}</dd>
                      </div>
                      {senior.diagnoses && (
                        <div className="flex w-full gap-1">
                          <dt className="shrink-0 font-medium text-foreground/70">
                            Diagnoses
                          </dt>
                          <dd>{senior.diagnoses}</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1.5 text-xs"
                    onClick={() => openEdit(senior)}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                    onClick={() => openDelete(senior)}
                  >
                    Delete
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
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
