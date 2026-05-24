import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { clearAuth, getTokenExpiry } from "./auth";

/**
 * Schedule a one-shot timer that logs the user out and redirects to /login
 * the moment the stored JWT's `exp` claim is reached. Mount this inside any
 * auth guard so an idle tab with the dashboard open can't keep using a token
 * that the backend will reject on the next request.
 */
export function useSessionExpiry() {
  const navigate = useNavigate();

  useEffect(() => {
    const expiresAt = getTokenExpiry();
    if (expiresAt === null) return undefined;

    const expire = () => {
      clearAuth();
      navigate("/login", { replace: true, state: { sessionExpired: true } });
    };

    const msUntilExpiry = expiresAt - Date.now();
    if (msUntilExpiry <= 0) {
      expire();
      return undefined;
    }

    const timer = window.setTimeout(expire, msUntilExpiry);
    return () => window.clearTimeout(timer);
  }, [navigate]);
}
