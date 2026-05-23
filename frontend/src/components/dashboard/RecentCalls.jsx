const toneDot = {
  warning: "bg-amber-400",
  success: "bg-secondary",
  danger: "bg-red-500",
};

export default function RecentCalls({ calls }) {
  return (
    <section className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Recent calls</h2>
      {calls.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No wellness calls yet. Automated check-ins will show up here.
        </p>
      ) : (
      <ul className="mt-4 space-y-4">
        {calls.map((call) => (
          <li key={call.id ?? `${call.name}-${call.time}`} className="flex gap-3">
            <span
              className={`mt-1.5 size-2.5 shrink-0 rounded-full ${toneDot[call.tone]}`}
              aria-hidden
            />
            <div>
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
                <p className="font-semibold text-foreground">{call.name}</p>
                <p className="text-xs text-muted">{call.time}</p>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-muted">
                {call.summary}
              </p>
            </div>
          </li>
        ))}
      </ul>
      )}
    </section>
  );
}
