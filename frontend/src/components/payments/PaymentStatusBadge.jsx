const STATUS_STYLES = {
  succeeded: "bg-green-100 text-green-700",
  paid: "bg-green-100 text-green-700",
  complete: "bg-green-100 text-green-700",
  completed: "bg-green-100 text-green-700",
  pending: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
  refunded: "bg-blue-100 text-blue-700",
  canceled: "bg-gray-100 text-gray-600",
};

export default function PaymentStatusBadge({ status }) {
  const normalized = String(status ?? "unknown").toLowerCase();
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
  const style = STATUS_STYLES[normalized] ?? "bg-gray-100 text-gray-600";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${style}`}>
      {label}
    </span>
  );
}
