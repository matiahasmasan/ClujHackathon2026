import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * OAuth Callback Handler Page
 * Handles Google OAuth redirects and completes login.
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const handledRef = useRef(false);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (handledRef.current) return;
    handledRef.current = true;

    const finishWithError = (errorMessage) => {
      setStatus("error");
      setMessage(errorMessage);
      window.opener?.postMessage(
        { type: "oauth_callback", error: errorMessage },
        window.location.origin
      );
    };

    const finishWithSuccess = (token, user) => {
      setStatus("success");
      setMessage("Login successful! Redirecting...");

      if (window.opener) {
        window.opener.postMessage(
          { type: "oauth_callback", token, user },
          window.location.origin
        );
        window.close();
        return;
      }

      localStorage.setItem("access_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      window.location.href = "/dashboard";
    };

    const handleCallback = async () => {
      if (error) {
        finishWithError(error);
        return;
      }

      if (!code) {
        finishWithError("No authorization code received");
        return;
      }

      const API_URL =
        import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

      try {
        const response = await fetch(
          `${API_URL}/oauth/google/callback?code=${encodeURIComponent(code)}`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          const detail = data.detail;
          const errorMessage = Array.isArray(detail)
            ? detail.map((item) => item.msg).join(", ")
            : detail || "OAuth authentication failed";
          finishWithError(errorMessage);
          return;
        }

        if (!data.token || !data.user) {
          finishWithError("Invalid response from server");
          return;
        }

        finishWithSuccess(data.token, data.user);
      } catch (err) {
        finishWithError(err.message || "OAuth callback failed");
      }
    };

    handleCallback();
  }, [code, error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-foreground">
          {status === "error"
            ? "Authentication failed"
            : status === "success"
              ? "Success!"
              : "Authenticating..."}
        </h1>
        <p className="mt-2 text-muted">
          {message ||
            (status === "loading"
              ? "Please wait while we complete your authentication."
              : "")}
        </p>
        {status === "loading" && (
          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div className="h-full w-1/3 animate-pulse bg-primary"></div>
          </div>
        )}
        {status === "error" && (
          <button
            type="button"
            onClick={() => window.close()}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
}
