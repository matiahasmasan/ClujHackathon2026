import Input from "../ui/Input";

export default function MedicationFormFields({
  form,
  updateField,
  loading,
  seniors,
  idPrefix = "medication",
  showTakenStatus = false,
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
          disabled={loading || seniors.length === 0}
          className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        >
          <option value="" disabled>
            {seniors.length === 0
              ? "Add a senior first"
              : "Select senior"}
          </option>
          {seniors.map((senior) => (
            <option key={senior.id} value={senior.id}>
              {senior.first_name} {senior.last_name}
            </option>
          ))}
        </select>
      </div>

      <Input
        id={`${idPrefix}-name`}
        label="Medication name"
        placeholder="Lisinopril"
        required
        value={form.medication_name}
        onChange={updateField("medication_name")}
        disabled={loading}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-dose`}
          label="Dose"
          placeholder="10mg"
          required
          value={form.dose}
          onChange={updateField("dose")}
          disabled={loading}
        />
        <Input
          id={`${idPrefix}-time`}
          label="Scheduled time"
          type="time"
          required
          value={form.scheduled_time}
          onChange={updateField("scheduled_time")}
          disabled={loading}
        />
      </div>

      {showTakenStatus && (
        <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-border/60 bg-surface/50 px-4 py-3">
          <input
            type="checkbox"
            checked={form.is_taken_today}
            onChange={updateField("is_taken_today")}
            disabled={loading}
            className="size-4 rounded border-border text-primary focus:ring-primary/20"
          />
          <span className="text-sm font-medium text-foreground">
            Marked as taken today
          </span>
        </label>
      )}
    </>
  );
}
