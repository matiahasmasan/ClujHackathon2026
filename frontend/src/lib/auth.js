export function saveUser({ first_name, last_name, email, phone_number, role }) {
  localStorage.setItem(
    "user",
    JSON.stringify({ first_name, last_name, email, phone_number, role }),
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

// Decode the (unverified) payload of a JWT. The backend is the only party that
// verifies the signature; here we just need to read public claims like `exp`.
function decodeJwtPayload(token) {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded));
  } catch {
    return null;
  }
}

/** Epoch-ms expiry of the stored access token, or null if missing/invalid. */
export function getTokenExpiry() {
  const payload = decodeJwtPayload(localStorage.getItem("access_token"));
  if (!payload || typeof payload.exp !== "number") return null;
  return payload.exp * 1000;
}

/** True if the stored token has an `exp` claim that is already in the past. */
export function isTokenExpired() {
  const expiresAt = getTokenExpiry();
  if (expiresAt === null) return false;
  return Date.now() >= expiresAt;
}

/**
 * True if an access token is present AND not expired. Eagerly clears the
 * stored token when it has expired so guards always see a clean state.
 */
export function isAuthenticated() {
  if (!localStorage.getItem("access_token")) return false;
  if (isTokenExpired()) {
    clearAuth();
    return false;
  }
  return true;
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
