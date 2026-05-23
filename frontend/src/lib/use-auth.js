import { useState, useCallback } from "react";
import { signUp, signIn, signOut, useSession } from "@/lib/better-auth";

/**
 * Hook for managing Better Auth in components
 */
export function useAuthForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { data: session, isPending } = useSession();

  const register = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/api/auth/sign-up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Registration failed");
        const data = await response.json();
        localStorage.setItem("access_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const login = useCallback(
    async (payload) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("http://localhost:8000/api/auth/sign-in", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!response.ok) throw new Error("Login failed");
        const data = await response.json();
        localStorage.setItem("access_token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return data;
      } catch (err) {
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      await signOut();
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    session,
    isAuthenticated: !!session,
    isLoading: loading || isPending,
    error,
    register,
    login,
    logout,
  };
}

/**
 * Hook for Better Auth 2FA
 */
export function useTwoFactorAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const setup2FA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/2fa/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Failed to setup 2FA");
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const verify2FA = useCallback(async (code, secret) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/2fa/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token, code, secret }),
      });
      if (!response.ok) throw new Error("Failed to verify 2FA");
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const disable2FA = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8000/api/2fa/disable", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("Failed to disable 2FA");
      return await response.json();
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    setup2FA,
    verify2FA,
    disable2FA,
    isLoading: loading,
    error,
  };
}
