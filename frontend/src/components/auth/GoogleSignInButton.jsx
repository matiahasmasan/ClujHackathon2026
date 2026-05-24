import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { googleLogin } from "../../lib/api";
import { saveUser } from "../../lib/auth";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Renders the official "Sign in with Google" button (Google Identity Services).
 * On success it exchanges the Google ID token for our JWT, stores it, and
 * navigates to the dashboard. Renders nothing if VITE_GOOGLE_CLIENT_ID is unset.
 *
 * Props:
 *   - onError(message): called when sign-in fails, so the parent can show it.
 *   - text: GSI button label ("continue_with" | "signin_with" | "signup_with").
 */
export default function GoogleSignInButton({ onError, text = "continue_with" }) {
  const navigate = useNavigate();
  const buttonRef = useRef(null);
  // Keep the latest onError without re-running the init effect on every render.
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  });

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return undefined;

    // The GSI script loads async, so window.google may not exist yet on mount.
    // Poll briefly until it does, then initialize and render the button once.
    let initialized = false;
    const interval = setInterval(() => {
      if (initialized || !window.google?.accounts?.id) return;
      initialized = true;
      clearInterval(interval);

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async ({ credential }) => {
          try {
            const data = await googleLogin(credential);
            localStorage.setItem("access_token", data.access_token);
            saveUser(data);
            navigate(data.role === "admin" ? "/admin" : "/dashboard");
          } catch (err) {
            onErrorRef.current?.(err.message);
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        text,
        width: 336,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigate, text]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <>
      <div className="my-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-border/60" />
        <span className="text-xs font-medium uppercase tracking-wide text-muted">
          or
        </span>
        <span className="h-px flex-1 bg-border/60" />
      </div>
      <div ref={buttonRef} className="flex justify-center" />
    </>
  );
}
