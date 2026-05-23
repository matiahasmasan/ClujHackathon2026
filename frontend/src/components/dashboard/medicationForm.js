export const emptyMedicationForm = {
  senior_id: "",
  medication_name: "",
  dose: "",
  scheduled_time: "",
  is_taken_today: false,
};

export function medicationToForm(medication) {
  return {
    senior_id: String(medication.senior_id ?? ""),
    medication_name: medication.medication_name,
    dose: medication.dose,
    scheduled_time: medication.scheduled_time,
    is_taken_today: Boolean(medication.is_taken_today),
  };
}

export function formToCreatePayload(form) {
  return {
    senior_id: Number(form.senior_id),
    medication_name: form.medication_name.trim(),
    dose: form.dose.trim(),
    scheduled_time: form.scheduled_time.trim(),
  };
}

export function formToUpdatePayload(form) {
  return {
    senior_id: Number(form.senior_id),
    medication_name: form.medication_name.trim(),
    dose: form.dose.trim(),
    scheduled_time: form.scheduled_time.trim(),
    is_taken_today: form.is_taken_today,
  };
}
