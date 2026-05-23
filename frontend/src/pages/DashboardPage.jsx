import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import GreetingCard from "../components/dashboard/GreetingCard";
import StatCard from "../components/dashboard/StatCard";
import CircleList from "../components/dashboard/CircleList";
import RecentCalls from "../components/dashboard/RecentCalls";
import MedicationsTable from "../components/dashboard/MedicationsTable";
import Button from "../components/ui/Button";
import { getInitials } from "../lib/auth";
import { formatRelativeTime } from "../lib/format";
import { fetchDashboard } from "../lib/api";

function buildStatCards(stats) {
  return [
    {
      label: "Seniors in care",
      value: String(stats.senior_count),
      sub: "Active in your circle",
      icon: "users",
      to: "/dashboard/seniors",
    },
    {
      label: "Meds today",
      value: `${stats.medications_taken}/${stats.medications_total}`,
      sub: "Doses taken so far",
      icon: "pill",
      to: "/dashboard/medications",
    },
    {
      label: "Wellness calls",
      value: String(stats.calls_completed_24h),
      sub: "Completed in last 24h",
      icon: "phone",
      to: "/dashboard/calls",
    },
    {
      label: "Active alerts",
      value: String(stats.active_alerts),
      sub: "Need your attention",
      icon: "alert",
      to: "/dashboard/calls",
    },
  ];
}

function buildCircleMembers(circle) {
  return circle.map((member) => ({
    id: member.id,
    initials: getInitials(member.first_name, member.last_name),
    name: `${member.first_name} ${member.last_name}`,
    age: member.age,
    diagnoses: member.diagnoses ?? null,
    lastCall: formatRelativeTime(member.last_call_at),
    status: member.status,
  }));
}

function buildMedicationRows(medications) {
  return medications.map((med) => {
    const [firstName, ...rest] = med.senior_name.split(" ");
    const lastName = rest.join(" ");

    return {
      id: med.id,
      initials: getInitials(firstName, lastName),
      senior: med.senior_name,
      medication: med.medication_name,
      dose: med.dose,
      time: med.scheduled_time,
      status: med.is_taken_today ? "taken" : "pending",
    };
  });
}

function buildRecentCalls(recentCalls) {
  return recentCalls.map((call) => ({
    id: call.id,
    name: call.senior_name,
    time: formatRelativeTime(call.started_at),
    summary: call.summary,
    tone: call.tone,
  }));
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
    () => (dashboard ? buildStatCards(dashboard.stats) : []),
    [dashboard],
  );

  const circleMembers = useMemo(
    () => (dashboard ? buildCircleMembers(dashboard.circle) : []),
    [dashboard],
  );

  const medicationRows = useMemo(
    () => (dashboard ? buildMedicationRows(dashboard.medications) : []),
    [dashboard],
  );

  const recentCalls = useMemo(
    () => (dashboard ? buildRecentCalls(dashboard.recent_calls) : []),
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
