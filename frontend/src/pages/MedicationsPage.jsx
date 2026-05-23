import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import Button from "../components/ui/Button";
import StatusBadge from "../components/dashboard/StatusBadge";
import AddMedicationModal from "../components/dashboard/AddMedicationModal";
import EditMedicationModal from "../components/dashboard/EditMedicationModal";
import DeleteMedicationModal from "../components/dashboard/DeleteMedicationModal";
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

  const stats = useMemo(() => {
    const taken = medications.filter((m) => m.is_taken_today).length;
    return {
      total: medications.length,
      taken,
      pending: medications.length - taken,
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

        {!loading && !error && medications.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted">Scheduled today</p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-secondary">{stats.taken}</p>
              <p className="text-xs text-muted">Taken</p>
            </div>
            <div className="rounded-xl bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              <p className="text-xs text-muted">Pending</p>
            </div>
          </div>
        )}
      </div>

      {loading && (
        <p className="text-center text-sm text-muted">Loading medications…</p>
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

      {!loading && !error && medications.length > 0 && (
        <section className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
          <h2 className="text-lg font-bold text-foreground">
            Today&apos;s schedule
          </h2>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-border/50 text-xs font-semibold tracking-wide text-muted uppercase">
                  <th className="pb-3 pr-4">Senior</th>
                  <th className="pb-3 pr-4">Medication</th>
                  <th className="pb-3 pr-4">Dose</th>
                  <th className="pb-3 pr-4">Time</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {medications.map((med) => {
                  const [firstName, ...rest] = med.senior_name.split(" ");
                  const lastName = rest.join(" ");
                  const initials = getInitials(firstName, lastName);
                  const status = med.is_taken_today ? "taken" : "pending";

                  return (
                    <tr key={med.id}>
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
