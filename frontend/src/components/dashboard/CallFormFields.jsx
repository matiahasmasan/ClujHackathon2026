import { CALL_STATUSES } from "./callForm";

export default function CallFormFields({
  form,
  updateField,
  loading,
  seniors,
  idPrefix = "call",
  showStatus = false,
  showCareNotes = false,
}) {
  return (
    <>
      <div>
        <label
          htmlFor={`${idPrefix}-senior`}
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          Senior
        </label>
        <select
          id={`${idPrefix}-senior`}
          required
          value={form.senior_id}
          onChange={updateField("senior_id")}
          disabled={loading || seniors.length === 0 || showCareNotes}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <option value="" disabled>
            {seniors.length === 0 ? "Add a senior first" : "Select senior"}
          </option>
          {seniors.map((senior) => (
            <option key={senior.id} value={senior.id}>
              {senior.first_name} {senior.last_name}
            </option>
          ))}
        </select>
      </div>

      {showStatus && (
        <div>
          <label
            htmlFor={`${idPrefix}-status`}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Status
          </label>
          <select
            id={`${idPrefix}-status`}
            required
            value={form.status}
            onChange={updateField("status")}
            disabled={loading}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            {CALL_STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label
          htmlFor={`${idPrefix}-notes`}
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          {showCareNotes ? "Caregiver notes" : "Notes (optional)"}
        </label>
        <textarea
          id={`${idPrefix}-notes`}
          rows={showCareNotes ? 2 : 3}
          placeholder="Observations from the call…"
          value={form.notes}
          onChange={updateField("notes")}
          disabled={loading}
          className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </div>

      {showCareNotes && (
        <>
          <div>
            <label
              htmlFor={`${idPrefix}-ai-summary`}
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              AI summary
            </label>
            <textarea
              id={`${idPrefix}-ai-summary`}
              rows={3}
              placeholder="Summary generated after the wellness call…"
              value={form.ai_summary}
              onChange={updateField("ai_summary")}
              disabled={loading}
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor={`${idPrefix}-health-flags`}
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Health flags
            </label>
            <textarea
              id={`${idPrefix}-health-flags`}
              rows={2}
              placeholder="e.g. dizziness, skipped meals"
              value={form.health_flags}
              onChange={updateField("health_flags")}
              disabled={loading}
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
            />
          </div>
        </>
      )}
    </>
  );
}
