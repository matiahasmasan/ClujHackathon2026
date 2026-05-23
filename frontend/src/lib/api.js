const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

function getStoredToken() {
  return localStorage.getItem("access_token");
}

function authHeaders() {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Not authenticated");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

function parseErrorMessage(data, fallback) {
  if (!data?.detail) return fallback;
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail)) {
    return data.detail.map((item) => item.msg).join(", ");
  }
  return fallback;
}

/**
 * Call POST /api/auth/sign-in (Better Auth endpoint).
 * Returns the parsed response on success, or throws an Error whose
 * message is suitable to show the user.
 */
export async function login({ email, password }) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/sign-in`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Login failed. Please try again."));
  }

  return data;
}

/**
 * Call GET /api/users (requires Bearer token).
 * Returns { message, count, users }.
 */
export async function fetchUsers() {
  let response;
  try {
    response = await fetch(`${API_URL}/users`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load users."));
  }

  return data;
}

/**
 * Call POST /api/auth/sign-up (Better Auth endpoint).
 * Returns the parsed response on success, or throws an Error whose
 * message is suitable to show the user.
 */
export async function register({
  first_name,
  last_name,
  email,
  password,
  phone_number,
}) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/sign-up`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name,
        last_name,
        email,
        password,
        phone_number,
      }),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Sign up failed. Please try again."));
  }

  return data;
}

/**
 * Call POST /api/auth/sign-out.
 * Logs out the current user.
 */
export async function logout() {
  try {
    await fetch(`${API_URL}/auth/sign-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Ignore errors on logout
  }
  localStorage.removeItem("access_token");
  localStorage.removeItem("user");
}

/**
 * Call POST /api/2fa/setup.
 * Setup 2FA for the current user. Requires Bearer token.
 * Returns QR code, secret, and backup codes.
 */
export async function setup2FA() {
  let response;
  try {
    response = await fetch(`${API_URL}/2fa/setup`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ token: getStoredToken() }),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Failed to setup 2FA."));
  }

  return data;
}

/**
 * Call POST /api/2fa/verify.
 * Verify 2FA code and enable it.
 */
export async function verify2FA(code, secret) {
  let response;
  try {
    response = await fetch(`${API_URL}/2fa/verify`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ token: getStoredToken(), code, secret }),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Invalid 2FA code."));
  }

  return data;
}

/**
 * Call POST /api/2fa/disable.
 * Disable 2FA for the current user.
 */
export async function disable2FA() {
  let response;
  try {
    response = await fetch(`${API_URL}/2fa/disable`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ token: getStoredToken() }),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Failed to disable 2FA."));
  }

  return data;
}
