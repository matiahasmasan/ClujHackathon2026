import StatusBadge from "./StatusBadge";

export default function CircleList({ members }) {
  return (
    <section className="rounded-2xl bg-card/75 p-5 shadow-sm backdrop-blur-sm sm:p-6">
      <h2 className="text-lg font-bold text-foreground">Your circle</h2>
      {members.length === 0 ? (
        <p className="mt-4 text-sm text-muted">
          No seniors in your circle yet. Add someone from the Seniors page.
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-border/50">
          {members.map((member) => (
            <li
              key={member.id ?? member.initials}
              className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                  {member.initials}
                </div>
                <div>
                  <p className="font-semibold text-foreground">{member.name}</p>
                  <dl className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-muted">
                    <div className="flex gap-1">
                      <dt className="font-medium text-foreground/70">Age</dt>
                      <dd>{member.age}</dd>
                    </div>
                    {member.diagnoses && (
                      <div className="flex w-full gap-1 sm:w-auto">
                        <dt className="shrink-0 font-medium text-foreground/70">
                          Diagnoses
                        </dt>
                        <dd>{member.diagnoses}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              </div>
              <div className="flex items-center gap-3 sm:flex-col sm:items-end sm:gap-1">
                <span className="text-xs text-muted">
                  Last call {member.lastCall}
                </span>
                <StatusBadge status={member.status} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
