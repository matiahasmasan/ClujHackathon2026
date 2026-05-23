import Input from "../ui/Input";
import { GENDER_OPTIONS } from "./seniorForm";

export default function SeniorFormFields({
  form,
  updateField,
  loading,
  idPrefix = "senior",
}) {
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-first-name`}
          label="First name"
          placeholder="Margaret"
          required
          autoComplete="given-name"
          value={form.first_name}
          onChange={updateField("first_name")}
          disabled={loading}
        />
        <Input
          id={`${idPrefix}-last-name`}
          label="Last name"
          placeholder="Hill"
          required
          autoComplete="family-name"
          value={form.last_name}
          onChange={updateField("last_name")}
          disabled={loading}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          id={`${idPrefix}-age`}
          label="Age"
          type="number"
          min={1}
          max={120}
          placeholder="82"
          required
          value={form.age}
          onChange={updateField("age")}
          disabled={loading}
        />
        <div>
          <label
            htmlFor={`${idPrefix}-gender`}
            className="mb-2 block text-sm font-semibold text-foreground"
          >
            Gender
          </label>
          <select
            id={`${idPrefix}-gender`}
            required
            value={form.gender}
            onChange={updateField("gender")}
            disabled={loading}
            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
          >
            <option value="" disabled>
              Select gender
            </option>
            {GENDER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <Input
        id={`${idPrefix}-phone`}
        label="Phone number"
        type="tel"
        placeholder="0712345678"
        maxLength={11}
        required
        autoComplete="tel"
        value={form.phone_number}
        onChange={updateField("phone_number")}
        disabled={loading}
      />

      <div>
        <label
          htmlFor={`${idPrefix}-diagnoses`}
          className="mb-2 block text-sm font-semibold text-foreground"
        >
          Diagnoses
        </label>
        <textarea
          id={`${idPrefix}-diagnoses`}
          rows={3}
          required
          placeholder="e.g. Early-stage dementia, hypertension"
          value={form.diagnoses}
          onChange={updateField("diagnoses")}
          disabled={loading}
          className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
        />
      </div>
    </>
  );
}
