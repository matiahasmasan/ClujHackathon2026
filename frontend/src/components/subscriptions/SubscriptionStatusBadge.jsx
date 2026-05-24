const STATUS_STYLES = {
  active: "bg-green-100 text-green-700",
  trialing: "bg-blue-100 text-blue-700",
  past_due: "bg-yellow-100 text-yellow-700",
  canceled: "bg-gray-100 text-gray-600",
  cancelled: "bg-gray-100 text-gray-600",
  incomplete: "bg-yellow-100 text-yellow-700",
  unpaid: "bg-red-100 text-red-700",
  paused: "bg-gray-100 text-gray-600",
};

export default function SubscriptionStatusBadge({ status }) {
  const normalized = String(status ?? "unknown").toLowerCase();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const style = STATUS_STYLES[normalized] ?? "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {label}
    </span>
  );
}
