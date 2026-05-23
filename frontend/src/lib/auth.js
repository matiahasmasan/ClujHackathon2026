export function saveUser({ first_name, last_name, email }) {
  localStorage.setItem(
    "user",
    JSON.stringify({ first_name, last_name, email }),
  );
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

export function getInitials(firstName, lastName) {
  const first = firstName?.trim()?.[0] ?? "";
  const last = lastName?.trim()?.[0] ?? "";
  return `${first}${last}`.toUpperCase() || "?";
}

/**
 * Censor the middle of an email for display, e.g.
 * "vintalexandru03@gmail.com" -> "vi•••••03@gmail.com".
 */
export function maskEmail(email) {
  if (!email || !email.includes("@")) return email ?? "";
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0] ?? ""}•••@${domain}`;
  const start = local.slice(0, 2);
  const end = local.length > 4 ? local.slice(-2) : "";
  return `${start}•••••${end}@${domain}`;
}
