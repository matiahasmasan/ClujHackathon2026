const styles = {
  "doing-well": "bg-secondary/10 text-secondary",
  "needs-attention": "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "missed-call": "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  taken: "bg-secondary/10 text-secondary",
  pending: "bg-surface text-muted ring-1 ring-border",
  initiated: "bg-surface text-muted ring-1 ring-border",
  ongoing: "bg-primary/10 text-primary",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-secondary/10 text-secondary",
  missed: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
  failed: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-300",
};

const labels = {
  "doing-well": "Doing well",
  "needs-attention": "Needs attention",
  "missed-call": "Missed call",
  taken: "Taken",
  pending: "Pending",
  initiated: "Initiated",
  ongoing: "In progress",
  in_progress: "In progress",
  completed: "Completed",
  missed: "Missed",
  failed: "Failed",
};

export default function StatusBadge({ status }) {
  const style = styles[status] ?? "bg-surface text-muted ring-1 ring-border";
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
