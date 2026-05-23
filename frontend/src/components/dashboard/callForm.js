export const CALL_STATUSES = [
  { value: "initiated", label: "Initiated" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "missed", label: "Missed" },
  { value: "failed", label: "Failed" },
];

export const emptyCallForm = {
  senior_id: "",
  status: "initiated",
  notes: "",
  ai_summary: "",
  health_flags: "",
};

export function callToForm(call) {
  return {
    senior_id: String(call.senior_id),
    status: call.status,
    notes: call.notes ?? "",
    ai_summary: call.ai_summary ?? "",
    health_flags: call.health_flags ?? "",
  };
}

export function formToCreatePayload(form) {
  return {
    senior_id: Number(form.senior_id),
    status: form.status,
    notes: form.notes.trim() || undefined,
  };
}

export function formToUpdatePayload(form) {
  return {
    status: form.status,
    notes: form.notes.trim() || null,
    ai_summary: form.ai_summary.trim() || null,
    health_flags: form.health_flags.trim() || null,
  };
}
