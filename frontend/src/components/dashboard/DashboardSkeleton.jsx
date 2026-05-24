function Bar({ className = "" }) {
  return <div className={`rounded-md bg-slate-200/70 ${className}`} />;
}

function Card({ children, className = "" }) {
  return (
    <div
      className={`rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <Card>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          <Bar className="h-3 w-24" />
          <Bar className="h-7 w-16" />
          <Bar className="h-3 w-28" />
        </div>
        <div className="size-10 rounded-xl bg-primary/10" />
      </div>
    </Card>
  );
}

export function StatCardGridSkeleton({ count = 4 }) {
  const cols =
    count === 2
      ? "sm:grid-cols-2"
      : count === 3
        ? "sm:grid-cols-3"
        : "sm:grid-cols-2 xl:grid-cols-4";

  return (
    <div
      className={`grid gap-4 motion-safe:animate-pulse ${cols}`}
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <ul
      className="divide-y divide-border/50 rounded-2xl bg-white/75 shadow-sm backdrop-blur-sm motion-safe:animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex min-w-0 flex-1 items-start gap-3">
            <div className="size-11 shrink-0 rounded-full bg-slate-200/70" />
            <div className="flex-1 space-y-2">
              <Bar className="h-4 w-40 max-w-full" />
              <Bar className="h-3 w-64 max-w-full" />
              <Bar className="h-3 w-32" />
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Bar className="h-7 w-16" />
            <Bar className="h-7 w-16" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export function MedicationsTableSkeleton({ rows = 5 }) {
  return (
    <section
      className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm motion-safe:animate-pulse sm:p-6"
      aria-busy="true"
    >
      <Bar className="h-5 w-40" />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-180 text-left text-sm">
          <thead>
            <tr className="border-b border-border/50">
              {Array.from({ length: 7 }).map((_, i) => (
                <th key={i} className="pb-3 pr-4">
                  <Bar className="h-3 w-16" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {Array.from({ length: rows }).map((_, i) => (
              <tr key={i}>
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <div className="size-8 rounded-full bg-slate-200/70" />
                    <Bar className="h-3 w-24" />
                  </div>
                </td>
                <td className="py-3.5 pr-4">
                  <Bar className="h-3 w-24" />
                </td>
                <td className="py-3.5 pr-4">
                  <Bar className="h-3 w-14" />
                </td>
                <td className="py-3.5 pr-4">
                  <Bar className="h-3 w-16" />
                </td>
                <td className="py-3.5 pr-4">
                  <Bar className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-3.5 pr-4">
                  <Bar className="h-5 w-16 rounded-full" />
                </td>
                <td className="py-3.5">
                  <div className="flex gap-2">
                    <Bar className="h-6 w-16" />
                    <Bar className="h-6 w-12" />
                    <Bar className="h-6 w-14" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export function CallCardListSkeleton({ rows = 3 }) {
  return (
    <div
      className="space-y-4 motion-safe:animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading calls…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <article
          key={i}
          className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <div className="flex items-start gap-4">
            <div className="size-12 shrink-0 rounded-2xl bg-slate-200/70" />
            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Bar className="h-4 w-40" />
                <Bar className="h-5 w-16 rounded-full" />
              </div>
              <Bar className="h-3 w-64 max-w-full" />
              <Bar className="h-3 w-32" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <Bar className="h-3 w-full" />
            <Bar className="h-3 w-11/12" />
            <Bar className="h-3 w-3/4" />
          </div>
        </article>
      ))}
    </div>
  );
}

export function SettingsFormSkeleton() {
  return (
    <div
      className="grid gap-6 motion-safe:animate-pulse lg:grid-cols-[minmax(0,280px)_1fr]"
      aria-busy="true"
    >
      <aside className="rounded-2xl bg-white/75 p-6 shadow-sm backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="size-20 rounded-2xl bg-slate-200/70" />
          <Bar className="h-5 w-32" />
          <Bar className="h-3 w-40" />
          <Bar className="h-3 w-24" />
        </div>
      </aside>
      <section className="rounded-2xl bg-white/75 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <Bar className="h-5 w-28" />
        <Bar className="mt-2 h-3 w-72 max-w-full" />
        <div className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Bar className="h-3 w-20" />
              <Bar className="h-10 w-full rounded-xl" />
            </div>
            <div className="space-y-2">
              <Bar className="h-3 w-20" />
              <Bar className="h-10 w-full rounded-xl" />
            </div>
          </div>
          <div className="space-y-2">
            <Bar className="h-3 w-12" />
            <Bar className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-2">
            <Bar className="h-3 w-24" />
            <Bar className="h-10 w-full rounded-xl" />
          </div>
          <div className="flex justify-end pt-2">
            <Bar className="h-10 w-32 rounded-xl" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function PricingPlanListSkeleton({ rows = 3 }) {
  return (
    <ul
      className="space-y-4 motion-safe:animate-pulse"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading plans…</span>
      {Array.from({ length: rows }).map((_, i) => (
        <li
          key={i}
          className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex flex-wrap items-center gap-2.5">
              <Bar className="h-5 w-32" />
              <Bar className="h-5 w-24 rounded-full" />
              <Bar className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex gap-2">
              <Bar className="h-7 w-20" />
              <Bar className="h-7 w-16" />
            </div>
          </div>
          <div className="mt-3 space-y-2">
            <Bar className="h-3 w-full max-w-md" />
            <div className="flex flex-wrap gap-x-5 gap-y-1">
              <Bar className="h-3 w-32" />
              <Bar className="h-3 w-28" />
              <Bar className="h-3 w-40" />
            </div>
          </div>
          <div className="mt-5 space-y-2 border-t border-border/40 pt-5">
            <Bar className="h-3 w-32" />
            <Bar className="h-9 w-full rounded-xl" />
            <Bar className="h-9 w-full rounded-xl" />
            <Bar className="h-9 w-full rounded-xl" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function HeaderBannerSkeleton() {
  return (
    <div className="rounded-2xl bg-linear-to-r from-primary/10 via-secondary/5 to-primary/5 p-6 shadow-sm backdrop-blur-sm sm:p-8">
      <div className="space-y-3">
        <Bar className="h-7 w-48" />
        <Bar className="h-3 w-80 max-w-full" />
        <Bar className="h-3 w-56" />
      </div>
    </div>
  );
}

export function RouteSkeleton() {
  return (
    <main
      className="flex-1 space-y-6 p-4 sm:p-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading page…</span>
      <HeaderBannerSkeleton />
      <StatCardGridSkeleton count={3} />
      <ListSkeleton rows={3} />
    </main>
  );
}

export function DashboardContentSkeleton() {
  return (
    <main
      className="flex-1 space-y-6 p-4 motion-safe:animate-pulse sm:p-6"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Loading dashboard…</span>

      <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/15 via-secondary/10 to-primary/5 p-6 sm:p-8">
        <div className="space-y-3">
          <Bar className="h-7 w-64 max-w-full" />
          <Bar className="h-3 w-80 max-w-full" />
          <Bar className="h-3 w-56 max-w-full" />
          <div className="pt-3">
            <Bar className="h-10 w-44 rounded-full" />
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <Bar className="mb-4 h-4 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl bg-white/40 p-3"
              >
                <div className="size-10 rounded-full bg-slate-200/70" />
                <div className="flex-1 space-y-2">
                  <Bar className="h-3 w-32" />
                  <Bar className="h-3 w-20" />
                </div>
                <Bar className="h-6 w-14 rounded-full" />
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <Bar className="mb-4 h-4 w-32" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 rounded-xl bg-white/40 p-3">
                <div className="flex items-center justify-between">
                  <Bar className="h-3 w-28" />
                  <Bar className="h-3 w-16" />
                </div>
                <Bar className="h-3 w-full" />
                <Bar className="h-3 w-3/4" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-0">
        <div className="p-5">
          <Bar className="h-4 w-40" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-t border-slate-100 px-4 py-3"
          >
            <div className="size-9 rounded-full bg-slate-200/70" />
            <Bar className="h-3 w-28" />
            <Bar className="h-3 w-24" />
            <Bar className="h-3 w-16" />
            <Bar className="ml-auto h-6 w-16 rounded-full" />
          </div>
        ))}
      </Card>
    </main>
  );
}

function SidebarSkeleton() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-100 bg-white/60 p-5 lg:block">
      <Bar className="mb-8 h-8 w-32" />
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bar key={i} className="h-9 w-full" />
        ))}
      </div>
    </aside>
  );
}

function HeaderSkeleton() {
  return (
    <header className="flex items-center justify-between border-b border-slate-100 bg-white/60 px-4 py-4 sm:px-6">
      <Bar className="h-5 w-40" />
      <Bar className="h-9 w-9 rounded-full" />
    </header>
  );
}

export default function DashboardLayoutSkeleton() {
  return (
    <div className="flex min-h-screen motion-safe:animate-pulse">
      <SidebarSkeleton />
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderSkeleton />
        <RouteSkeleton />
      </div>
    </div>
  );
}
