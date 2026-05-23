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
 * Call GET /api/seniors/:id (requires Bearer token).
 */
export async function fetchSenior(seniorId) {
  let response;
  try {
    response = await fetch(`${API_URL}/seniors/${seniorId}`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load senior."));
  }

  return data;
}

/**
 * Call PATCH /api/seniors/:id (requires Bearer token).
 */
export async function updateSenior(seniorId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/seniors/${seniorId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not update senior."));
  }

  return data;
}

/**
 * Call DELETE /api/seniors/:id (requires Bearer token).
 */
export async function deleteSenior(seniorId) {
  let response;
  try {
    response = await fetch(`${API_URL}/seniors/${seniorId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 204) return;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not delete senior."));
  }
}

/**
 * Call GET /api/medications (requires Bearer token).
 * Returns { count, medications }.
 */
export async function fetchMedications() {
  let response;
  try {
    response = await fetch(`${API_URL}/medications`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load medications."));
  }

  return data;
}

/**
 * Call POST /api/medications (requires Bearer token).
 */
export async function createMedication(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/medications`, {
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
    throw new Error(parseErrorMessage(data, "Could not add medication."));
  }

  return data;
}

/**
 * Call PATCH /api/medications/:id (requires Bearer token).
 */
export async function updateMedication(medicationId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/medications/${medicationId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not update medication."));
  }

  return data;
}

/**
 * Call DELETE /api/medications/:id (requires Bearer token).
 */
export async function deleteMedication(medicationId) {
  let response;
  try {
    response = await fetch(`${API_URL}/medications/${medicationId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  if (response.status === 204) return;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not delete medication."));
  }
}

/**
 * Call GET /api/calls (requires Bearer token).
 * Returns { count, calls }.
 */
export async function fetchCalls() {
  let response;
  try {
    response = await fetch(`${API_URL}/calls`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load calls."));
  }

  return data;
}

/**
 * Call GET /api/auth/me (requires Bearer token).
 */
export async function fetchProfile() {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load profile."));
  }

  return data;
}

/**
 * Call PATCH /api/auth/me (requires Bearer token).
 */
export async function updateProfile(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/auth/me`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not update profile."));
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

/**
 * Call GET /api/pricing (public).
 */
export async function fetchPricing() {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing`);
  } catch {
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load pricing plans."));
  }

  return data;
}
