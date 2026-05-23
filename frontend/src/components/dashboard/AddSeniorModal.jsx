import Button from "../ui/Button";
import Input from "../ui/Input";

const GENDER_OPTIONS = ["Female", "Male", "Non-binary", "Other", "Prefer not to say"];

export default function AddSeniorModal({ open, onClose }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-senior-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
      />

      <div className="relative max-h-[90dvh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2
              id="add-senior-title"
              className="text-xl font-bold text-foreground"
            >
              Add senior
            </h2>
            <p className="mt-1 text-sm text-muted">
              Add someone to your care circle. Details can be edited later.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="senior-first-name"
              label="First name"
              placeholder="Margaret"
              required
              autoComplete="given-name"
            />
            <Input
              id="senior-last-name"
              label="Last name"
              placeholder="Hill"
              required
              autoComplete="family-name"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="senior-age"
              label="Age"
              type="number"
              min={1}
              max={120}
              placeholder="82"
              required
            />
            <div>
              <label
                htmlFor="senior-gender"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Gender
              </label>
              <select
                id="senior-gender"
                required
                defaultValue=""
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
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
            id="senior-phone"
            label="Phone number"
            type="tel"
            placeholder="0712345678"
            maxLength={11}
            required
            autoComplete="tel"
          />

          <div>
            <label
              htmlFor="senior-diagnoses"
              className="mb-2 block text-sm font-semibold text-foreground"
            >
              Diagnoses{" "}
              <span className="font-normal text-muted">(optional)</span>
            </label>
            <textarea
              id="senior-diagnoses"
              rows={3}
              placeholder="e.g. Early-stage dementia, hypertension"
              className="w-full resize-y rounded-xl border border-border bg-white px-4 py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Add senior
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
