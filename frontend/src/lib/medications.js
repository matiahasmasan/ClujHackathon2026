/** Helpers for the medication rows used by the senior add/edit modals. */

/** A blank medication row. `id` is set only for rows that exist in the DB. */
export const emptyMedication = {
  medication_name: "",
  dose: "",
  scheduled_time: "",
  stock: "",
};

/**
 * Keep only medications worth saving (those with a name), and validate that
 * each such row also has a dose. Returns { rows, error }.
 */
export function prepareMedications(medications) {
  const rows = medications.filter((m) => m.medication_name.trim() !== "");
  for (const m of rows) {
    if (m.dose.trim() === "") {
      return { rows: [], error: "Each medication needs both a name and a dose." };
    }
  }
  return { rows, error: "" };
}

/** Build the API payload for a single medication row (for a given senior). */
export function medicationPayload(row, seniorId) {
  const payload = {
    senior_id: seniorId,
    medication_name: row.medication_name.trim(),
    dose: row.dose.trim(),
    stock: row.stock === "" ? 0 : Number(row.stock),
  };
  if (row.scheduled_time) payload.scheduled_time = row.scheduled_time;
  return payload;
}
