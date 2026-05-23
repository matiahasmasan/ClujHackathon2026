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
 * Call POST /api/auth/login.
 * Returns the parsed LoginResponse on success, or throws an Error whose
 * message is suitable to show the user.
 */
export async function login({ email, password }) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/login`, {
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
 * Call POST /api/auth/google with the ID token from Google Identity Services.
 * Returns the parsed LoginResponse on success, or throws a user-facing Error.
 */
export async function googleLogin(credential) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential }),
    });
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      parseErrorMessage(data, "Google sign-in failed. Please try again."),
    );
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
 * Call GET /api/dashboard (requires Bearer token).
 * Returns { seniors, medications, stats }.
 */
export async function fetchDashboard() {
  let response;
  try {
    response = await fetch(`${API_URL}/dashboard`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load dashboard."));
  }

  return data;
}

/**
 * Call GET /api/seniors (requires Bearer token).
 * Returns { count, seniors }.
 */
export async function fetchSeniors() {
  let response;
  try {
    response = await fetch(`${API_URL}/seniors`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load seniors."));
  }

  return data;
}

/**
 * Call POST /api/seniors (requires Bearer token).
 * Returns the created senior.
 */
export async function createSenior(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/seniors`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not add senior."));
  }

  return data;
}

/**
 * Call POST /api/auth/register.
 * Returns the parsed UserResponse on success, or throws an Error whose
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
    response = await fetch(`${API_URL}/auth/register`, {
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
