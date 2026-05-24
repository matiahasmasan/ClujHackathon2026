import StatusBadge from "./StatusBadge";

export default function MedicationsTable({ rows }) {
  return (
    <section className="rounded-2xl bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Today&apos;s medications</h2>

      {rows.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No medications scheduled today.
        </p>
      ) : (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[540px] text-left text-sm">
          <thead>
            <tr className="border-b border-border/50 text-xs font-semibold tracking-wide text-muted uppercase">
              <th className="pb-3 pr-4">Senior</th>
              <th className="pb-3 pr-4">Medication</th>
              <th className="pb-3 pr-4">Dose</th>
              <th className="pb-3 pr-4">Time</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {rows.map((row) => (
              <tr
                key={row.id ?? `${row.senior}-${row.medication}`}
                className="dashboard-row-hover"
              >
                <td className="py-3.5 pr-4">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-8 items-center justify-center rounded-full bg-secondary/10 text-xs font-bold text-secondary">
                      {row.initials}
                    </span>
                    <span className="font-medium text-foreground">
                      {row.senior}
                    </span>
                  </div>
                </td>
                <td className="py-3.5 pr-4 text-foreground">{row.medication}</td>
                <td className="py-3.5 pr-4 text-muted">{row.dose}</td>
                <td className="py-3.5 pr-4 text-muted">{row.time}</td>
                <td className="py-3.5">
                  <StatusBadge status={row.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}
    </section>
  );
}
