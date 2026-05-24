import { Link } from "react-router-dom";

function StatIcon({ name }) {
  const className = "size-5 text-primary";

  if (name === "users") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
      </svg>
    );
  }
  if (name === "pill") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      </svg>
    );
  }
  if (name === "phone") {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    );
  }
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

export default function StatCard({ label, value, sub, icon, to }) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
        <p className="mt-1 text-xs text-muted">{sub}</p>
      </div>
      <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
        <StatIcon name={icon} />
      </div>
    </div>
  );

  const baseClass =
    "rounded-2xl bg-card/75 p-5 shadow-sm backdrop-blur-sm";

  if (to) {
    return (
      <Link
        to={to}
        className={`block ${baseClass} transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30`}
        aria-label={`${label}: ${value}`}
      >
        {content}
      </Link>
    );
  }

  return <article className={baseClass}>{content}</article>;
}
