import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import GreetingCard from "../components/dashboard/GreetingCard";
import StatCard from "../components/dashboard/StatCard";
import CircleList from "../components/dashboard/CircleList";
import RecentCalls from "../components/dashboard/RecentCalls";
import MedicationsTable from "../components/dashboard/MedicationsTable";
import Button from "../components/ui/Button";
import { getInitials } from "../lib/auth";
import { fetchDashboard } from "../lib/api";
import {
  stats as mockStats,
  circleMembers as mockCircleMembers,
  recentCalls,
} from "../data/dashboardMock";

function buildCircleMembers(seniors) {
  const mockByName = Object.fromEntries(
    mockCircleMembers.map((m) => [m.name, m]),
  );

  return seniors.map((senior) => {
    const name = `${senior.first_name} ${senior.last_name}`;
    const mock = mockByName[name];
    return {
      id: senior.id,
      initials: getInitials(senior.first_name, senior.last_name),
      name,
      age: senior.age,
      diagnoses: senior.diagnoses ?? null,
      lastCall: mock?.lastCall ?? "—",
      status: mock?.status ?? "doing-well",
    };
  });
}

function buildMedicationRows(medications) {
  return medications.map((med) => {
    const [firstName, ...rest] = med.senior_name.split(" ");
    const lastName = rest.join(" ");

    return {
      initials: getInitials(firstName, lastName),
      senior: med.senior_name,
      medication: med.medication_name,
      dose: med.dose,
      time: med.scheduled_time,
      status: med.is_taken_today ? "taken" : "pending",
    };
  });
}

function buildStatCards(apiStats) {
  return mockStats.map((stat) => {
    if (stat.label === "Seniors in care") {
      return {
        ...stat,
        value: String(apiStats.senior_count),
      };
    }
    if (stat.label === "Meds today") {
      const { medications_taken, medications_total } = apiStats;
      return {
        ...stat,
        value: `${medications_taken}/${medications_total}`,
      };
    }
    return stat;
  });
}

export default function DashboardPage() {
  const { user, seniorsVersion } = useOutletContext();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard, seniorsVersion]);

  const statCards = useMemo(
    () => (dashboard ? buildStatCards(dashboard.stats) : mockStats),
    [dashboard],
  );

  const circleMembers = useMemo(
    () =>
      dashboard ? buildCircleMembers(dashboard.seniors) : mockCircleMembers,
    [dashboard],
  );

  const medicationRows = useMemo(
    () =>
      dashboard ? buildMedicationRows(dashboard.medications) : [],
    [dashboard],
  );

  return (
    <main className="flex-1 space-y-6 p-4 sm:p-6">
      {loading && (
        <p className="text-center text-sm text-muted">Loading dashboard…</p>
      )}

      {error && (
        <div className="flex flex-col items-center gap-3 rounded-2xl bg-white/75 p-6 text-center shadow-sm">
          <p className="text-sm text-red-600">{error}</p>
          <Button onClick={loadDashboard} className="px-4 py-2 text-sm">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && dashboard && (
        <>
          <GreetingCard
            firstName={user.first_name}
            seniorCount={dashboard.stats.senior_count}
            medsTaken={dashboard.stats.medications_taken}
            medsTotal={dashboard.stats.medications_total}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <CircleList members={circleMembers} />
            <RecentCalls calls={recentCalls} />
          </div>

          <MedicationsTable rows={medicationRows} />
        </>
      )}
    </main>
  );
}
