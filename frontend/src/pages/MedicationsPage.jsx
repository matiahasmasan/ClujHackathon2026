import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import StatCard from "../components/dashboard/StatCard";
import StatusBadge from "../components/dashboard/StatusBadge";
import AddMedicationModal from "../components/dashboard/AddMedicationModal";
import EditMedicationModal from "../components/dashboard/EditMedicationModal";
import DeleteMedicationModal from "../components/dashboard/DeleteMedicationModal";
import {
  MedicationsTableSkeleton,
  StatCardGridSkeleton,
} from "../components/dashboard/DashboardSkeleton";
import { getInitials } from "../lib/auth";
import { fetchMedications, updateMedication } from "../lib/api";

function formatTime(time) {
  const [hours, minutes] = time.split(":");
  const hour = Number(hours);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${suffix}`;
}

export default function MedicationsPage() {
  const { medicationsVersion, bumpMedications } = useOutletContext();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [togglingId, setTogglingId] = useState(null);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadMedications = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMedications();
      setMedications(data.medications);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMedications();
  }, [loadMedications, medicationsVersion]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return medications;
    return medications.filter(
      (m) =>
        m.medication_name.toLowerCase().includes(q) ||
        m.senior_name.toLowerCase().includes(q) ||
        m.dose.toLowerCase().includes(q),
    );
  }, [medications, query]);

  const stats = useMemo(() => {
    const taken = medications.filter((m) => m.is_taken_today).length;
    const lowStock = medications.filter((m) => m.stock < 10).length;
    return {
      total: medications.length,
      taken,
      pending: medications.length - taken,
      lowStock,
    };
  }, [medications]);

  function handleMutationSuccess() {
    bumpMedications?.();
  }

  function openEdit(medication) {
    setSelectedMedication(medication);
    setEditOpen(true);
  }

  function openDelete(medication) {
    setSelectedMedication(medication);
    setDeleteOpen(true);
  }

  async function toggleTaken(medication) {
    setTogglingId(medication.id);
    try {
      await updateMedication(medication.id, {
        is_taken_today: !medication.is_taken_today,
      });
      handleMutationSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              Medications
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
              Daily schedules for everyone in your circle. Mark doses as taken
              and keep times up to date.
            </p>
          </div>
          <Button
            type="button"
            className="shrink-0 px-4 py-2 text-sm"
            onClick={() => setAddOpen(true)}
          >
            + Add medication
          </Button>
        </div>

        <label className="relative mt-2 block">
          <span className="sr-only">Search medications</span>
          <svg className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="search"
            placeholder="Search by medication, senior, or dose…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-white/70 py-2.5 pr-4 pl-10 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </label>
      </div>

      {!loading && !error && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Meds today"
            value={String(stats.total)}
            sub="Scheduled for today"
            icon="pill"
          />
          <StatCard
            label="Taken"
            value={String(stats.taken)}
            sub="Doses marked taken"
            icon="pill"
          />
          <StatCard
            label="Pending"
            value={String(stats.pending)}
            sub="Still due today"
            icon="pill"
          />
          <StatCard
            label="Low stock"
            value={String(stats.lowStock)}
            sub="Under 10 units left"
            icon="pill"
          />
        </div>
      )}

      {loading && (
        <>
          <StatCardGridSkeleton count={4} />
          <MedicationsTableSkeleton rows={5} />
        </>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={loadMedications} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && medications.length === 0 && (
        <div className="rounded-2xl bg-white/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">
            No medications scheduled yet. Add a senior to your circle, then use
            &quot;+ Add medication&quot; to create a daily reminder.
          </p>
        </div>
      )}

      {!loading && !error && medications.length > 0 && filtered.length === 0 && (
        <div className="rounded-2xl bg-white/75 p-8 text-center shadow-sm">
          <p className="text-sm text-muted">No medications match &quot;{query}&quot;.</p>
        </div>
      )}

      {!loading && !error && filtered.length > 0 && (
        <section className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-bold text-foreground">
            Today&apos;s schedule
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-180 text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs font-semibold tracking-wide text-muted uppercase">
                  <th className="pb-3 pr-4">Senior</th>
                  <th className="pb-3 pr-4">Medication</th>
                  <th className="pb-3 pr-4">Dose</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Stock</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filtered.map((med) => {
                  const [firstName, ...rest] = med.senior_name.split(" ");
                  const lastName = rest.join(" ");
                  const initials = getInitials(firstName, lastName);
                  const status = med.is_taken_today ? "taken" : "pending";

                  const stockLevel =
                    med.stock === 0
                      ? "out"
                      : med.stock < 10
                        ? "low"
                        : "ok";

                  return (
                    <tr key={med.id} className={stockLevel === "out" ? "bg-red-50/50" : stockLevel === "low" ? "bg-amber-50/50" : ""}>
                      <td className="py-3.5 pr-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex size-8 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                            {initials}
                          </span>
                          <span className="font-medium text-foreground">
                            {med.senior_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 pr-4 font-medium text-foreground">
                        {med.medication_name}
                      </td>
                      <td className="py-3.5 pr-4 text-muted">{med.dose}</td>
                      <td className="py-3.5 pr-4 text-muted">
                        {formatTime(med.scheduled_time)}
                      </td>
                      <td className="py-3.5 pr-4">
                        {stockLevel === "out" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                            <svg className="size-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                            Out of stock
                          </span>
                        )}
                        {stockLevel === "low" && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                            <svg className="size-3" viewBox="0 0 20 20" fill="currentColor" aria-hidden><path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
                            {med.stock} left
                          </span>
                        )}
                        {stockLevel === "ok" && (
                          <span className="text-sm text-muted">{med.stock}</span>
                        )}
                      </td>
                      <td className="py-3.5 pr-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => toggleTaken(med)}
                            disabled={togglingId === med.id}
                          >
                            {togglingId === med.id
                              ? "Updating…"
                              : med.is_taken_today
                                ? "Mark pending"
                                : "Mark taken"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            className="px-3 py-1.5 text-xs"
                            onClick={() => openEdit(med)}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            className="bg-red-600 px-3 py-1.5 text-xs hover:bg-red-600/90"
                            onClick={() => openDelete(med)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <AddMedicationModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <EditMedicationModal
        open={editOpen}
        medication={selectedMedication}
        onClose={() => setEditOpen(false)}
        onSuccess={handleMutationSuccess}
      />

      <DeleteMedicationModal
        open={deleteOpen}
        medication={selectedMedication}
        onClose={() => setDeleteOpen(false)}
        onSuccess={handleMutationSuccess}
      />
    </main>
  );
}
