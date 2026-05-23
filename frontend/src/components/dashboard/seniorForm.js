export const GENDER_OPTIONS = [
  "Female",
  "Male",
  "Non-binary",
  "Other",
  "Prefer not to say",
];

export const emptySeniorForm = {
  first_name: "",
  last_name: "",
  age: "",
  gender: "",
  phone_number: "",
  diagnoses: "",
};

export function seniorToForm(senior) {
  if (!senior) return { ...emptySeniorForm };
  return {
    first_name: senior.first_name ?? "",
    last_name: senior.last_name ?? "",
    age: String(senior.age ?? ""),
    gender: senior.gender ?? "",
    phone_number: senior.phone_number ?? "",
    diagnoses: senior.diagnoses ?? "",
  };
}

export function formToPayload(form) {
  return {
    first_name: form.first_name.trim(),
    last_name: form.last_name.trim(),
    age: Number(form.age),
    gender: form.gender,
    phone_number: form.phone_number.trim(),
    diagnoses: form.diagnoses.trim(),
  };
}
