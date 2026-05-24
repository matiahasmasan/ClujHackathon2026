import { clearAuth } from "./auth";

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

// If the server rejects our token (expired, revoked, clock skew, user deleted),
// clear local state and bounce to /login. Throws so callers stop processing.
function handleAuth(response) {
  if (response.status !== 401) return;
  clearAuth();
  if (
    typeof window !== "undefined" &&
    !window.location.pathname.startsWith("/login")
  ) {
    window.location.assign("/login");
  }
  throw new Error("Session expired. Please sign in again.");
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
 * Call GET /api/users (admin only).
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

  handleAuth(response);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not load users."));
  }

  return data;
}

/**
 * Call POST /api/users (admin only).
 */
export async function createUser(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  handleAuth(response);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not create user."));
  }

  return data;
}

/**
 * Call PATCH /api/users/:id (admin only).
 */
export async function updateUser(userId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/users/${userId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  handleAuth(response);

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not update user."));
  }

  return data;
}

/**
 * Call DELETE /api/users/:id (admin only).
 */
export async function deleteUser(userId) {
  let response;
  try {
    response = await fetch(`${API_URL}/users/${userId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }

  handleAuth(response);

  if (response.status === 204) return;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(parseErrorMessage(data, "Could not delete user."));
  }
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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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

  handleAuth(response);

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
    throw new Error(
      parseErrorMessage(data, "Sign up failed. Please try again."),
    );
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

export async function createPlan(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not create plan."));
  return data;
}

export async function updatePlan(planId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing/${planId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not update plan."));
  return data;
}

export async function deletePlan(planId) {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing/${planId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  if (response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not delete plan."));
}

export async function createFeature(planId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing/${planId}/features`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not add feature."));
  return data;
}

export async function updateFeature(featureId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing/features/${featureId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not update feature."));
  return data;
}

export async function deleteFeature(featureId) {
  let response;
  try {
    response = await fetch(`${API_URL}/pricing/features/${featureId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  if (response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not delete feature."));
}

export async function fetchReviews() {
  let response;
  try {
    response = await fetch(`${API_URL}/reviews`, { headers: authHeaders() });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not load reviews."));
  return data;
}

export async function createReview(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/reviews`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not submit review."));
  return data;
}

export async function updateReview(reviewId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not update review."));
  return data;
}

export async function deleteReview(reviewId) {
  let response;
  try {
    response = await fetch(`${API_URL}/reviews/${reviewId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  if (response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not delete review."));
}

export async function fetchAllReviews() {
  let response;
  try {
    response = await fetch(`${API_URL}/reviews/admin/all`, { headers: authHeaders() });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not load reviews."));
  return data;
}

export async function fetchPayments() {
  let response;
  try {
    response = await fetch(`${API_URL}/payments`, { headers: authHeaders() });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not load payments."));
  return data;
}

export async function fetchAllPayments() {
  let response;
  try {
    response = await fetch(`${API_URL}/payments/admin/all`, { headers: authHeaders() });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not load payments."));
  return data;
}

export async function createPayment(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/payments`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not create payment."));
  return data;
}

export async function updatePayment(paymentId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/payments/${paymentId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not update payment."));
  return data;
}

export async function deletePayment(paymentId) {
  let response;
  try {
    response = await fetch(`${API_URL}/payments/${paymentId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  if (response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not delete payment."));
}

export async function fetchSubscriptions() {
  let response;
  try {
    response = await fetch(`${API_URL}/subscriptions`, { headers: authHeaders() });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not load subscriptions."));
  return data;
}

export async function cancelMySubscription() {
  let response;
  try {
    response = await fetch(`${API_URL}/subscriptions/mine/cancel`, {
      method: "POST",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not cancel subscription."));
  return data;
}

export async function fetchAllSubscriptions() {
  let response;
  try {
    response = await fetch(`${API_URL}/subscriptions/admin/all`, { headers: authHeaders() });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not load subscriptions."));
  return data;
}

export async function createSubscription(payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/subscriptions`, {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not create subscription."));
  return data;
}

export async function updateSubscription(subscriptionId, payload) {
  let response;
  try {
    response = await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
      method: "PATCH",
      headers: authHeaders(),
      body: JSON.stringify(payload),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not update subscription."));
  return data;
}

export async function deleteSubscription(subscriptionId) {
  let response;
  try {
    response = await fetch(`${API_URL}/subscriptions/${subscriptionId}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
  } catch (err) {
    if (err.message === "Not authenticated") throw err;
    throw new Error("Cannot reach the server. Is the backend running?");
  }
  handleAuth(response);
  if (response.status === 204) return;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(parseErrorMessage(data, "Could not delete subscription."));
}
