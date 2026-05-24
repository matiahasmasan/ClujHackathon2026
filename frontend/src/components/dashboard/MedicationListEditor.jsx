import Button from "../ui/Button";
import Input from "../ui/Input";
import { emptyMedication } from "../../lib/medications";

/**
 * Editable list of medications for a senior. Renders one card per medication
 * with an "Add another medication" button. `medication_name` and `dose` are
 * required per row; `scheduled_time` and `stock` are optional.
 *
 * Controlled: `medications` is the array, `onChange` receives the next array.
 * Each row is `{ id?, medication_name, dose, scheduled_time, stock }`.
 */
export default function MedicationListEditor({
  medications,
  onChange,
  disabled = false,
  idPrefix = "med",
}) {
  function updateRow(index, field) {
    return (e) => {
      const value = e.target.value;
      onChange(
        medications.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
      );
    };
  }

  function addRow() {
    onChange([...medications, { ...emptyMedication }]);
  }

  function removeRow(index) {
    onChange(medications.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-3">
      <span className="block text-sm font-semibold text-foreground">
        Medications
      </span>

      {medications.map((med, index) => (
        <div
          key={index}
          className="space-y-3 rounded-xl border border-border/60 bg-surface/40 p-4"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted">
              Medication {index + 1}
            </span>
            {medications.length > 1 && (
              <button
                type="button"
                onClick={() => removeRow(index)}
                disabled={disabled}
                className="text-xs font-medium text-red-600 transition-colors hover:underline disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              id={`${idPrefix}-name-${index}`}
              label="Medication Name"
              placeholder="Aspirin"
              value={med.medication_name}
              onChange={updateRow(index, "medication_name")}
              disabled={disabled}
            />
            <Input
              id={`${idPrefix}-dose-${index}`}
              label="Dose"
              placeholder="e.g. 1 pill / 100mg"
              value={med.dose}
              onChange={updateRow(index, "dose")}
              disabled={disabled}
            />
            <Input
              id={`${idPrefix}-time-${index}`}
              label="Scheduled Time"
              type="time"
              value={med.scheduled_time}
              onChange={updateRow(index, "scheduled_time")}
              disabled={disabled}
            />
            <Input
              id={`${idPrefix}-stock-${index}`}
              label="Stocks"
              type="number"
              min={0}
              placeholder="e.g. 30 left"
              value={med.stock}
              onChange={updateRow(index, "stock")}
              disabled={disabled}
            />
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        onClick={addRow}
        disabled={disabled}
        className="w-full px-4 py-2 text-sm sm:w-auto"
      >
        + Add another medication
      </Button>
    </div>
  );
}
