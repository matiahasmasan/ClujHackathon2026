import DashboardSidebar from "../components/dashboard/DashboardSidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import GreetingCard from "../components/dashboard/GreetingCard";
import StatCard from "../components/dashboard/StatCard";
import CircleList from "../components/dashboard/CircleList";
import RecentCalls from "../components/dashboard/RecentCalls";
import MedicationsTable from "../components/dashboard/MedicationsTable";
import {
  stats,
  circleMembers,
  recentCalls,
  medications,
} from "../data/dashboardMock";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen">
      <DashboardSidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <DashboardHeader />

        <main className="flex-1 space-y-6 p-4 sm:p-6">
          <GreetingCard />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <CircleList members={circleMembers} />
            <RecentCalls calls={recentCalls} />
          </div>

          <MedicationsTable rows={medications} />
        </main>
      </div>
    </div>
  );
}
