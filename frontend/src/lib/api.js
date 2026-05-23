const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

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
    throw new Error(data?.detail ?? "Login failed. Please try again.");
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
    throw new Error(data?.detail ?? "Sign up failed. Please try again.");
  }

  return data;
}
