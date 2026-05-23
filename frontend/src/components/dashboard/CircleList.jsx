import StatusBadge from "./StatusBadge";

export default function CircleList({ members }) {
  return (
    <section className="rounded-2xl bg-white/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Your circle</h2>
      <ul className="mt-4 divide-y divide-border/50">
        {members.map((member) => (
          <li
            key={member.initials}
            className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                {member.initials}
              </div>
              <div>
                <p className="font-semibold text-foreground">{member.name}</p>
                <p className="text-sm text-muted">{member.meta}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
              <span className="text-xs text-muted">Last call {member.lastCall}</span>
              <StatusBadge status={member.status} />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
