const styles = {
  "doing-well": "bg-secondary/10 text-secondary",
  "needs-attention": "bg-amber-100 text-amber-700",
  "missed-call": "bg-red-100 text-red-600",
  taken: "bg-secondary/10 text-secondary",
  pending: "bg-slate-100 text-slate-600",
  initiated: "bg-slate-100 text-slate-600",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-secondary/10 text-secondary",
  missed: "bg-red-100 text-red-600",
  failed: "bg-red-100 text-red-600",
};

const labels = {
  "doing-well": "Doing well",
  "needs-attention": "Needs attention",
  "missed-call": "Missed call",
  taken: "Taken",
  pending: "Pending",
  initiated: "Initiated",
  in_progress: "In progress",
  completed: "Completed",
  missed: "Missed",
  failed: "Failed",
};

export default function StatusBadge({ status }) {
  const style = styles[status] ?? "bg-slate-100 text-slate-600";
  const label =
    labels[status] ??
    String(status).replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <span
      className={`inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${style}`}
    >
      {label}
    </span>
  );
}
