const styles = {
  "doing-well": "bg-secondary/10 text-secondary",
  "needs-attention": "bg-amber-100 text-amber-700",
  "missed-call": "bg-red-100 text-red-600",
  taken: "bg-secondary/10 text-secondary",
  pending: "bg-slate-100 text-slate-600",
};

const labels = {
  "doing-well": "Doing well",
  "needs-attention": "Needs attention",
  "missed-call": "Missed call",
  taken: "Taken",
  pending: "Pending",
};

export default function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
