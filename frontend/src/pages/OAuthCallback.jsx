import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

/**
 * OAuth Callback Handler Page
 * This page handles OAuth redirects from Google and GitHub
 * Extracts the authorization code and sends it back to the parent window
 */
export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (error) {
          // Send error back to parent window
          window.opener?.postMessage(
            {
              type: "oauth_callback",
              error: error,
            },
            window.location.origin
          );
          return;
        }

        if (!code) {
          window.opener?.postMessage(
            {
              type: "oauth_callback",
              error: "No authorization code received",
            },
            window.location.origin
          );
          return;
        }

        // Determine provider from referrer or pathname
        const provider = window.location.pathname.includes("google")
          ? "google"
          : "github";

        const API_URL =
          import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

        // Exchange code for token on backend
        const response = await fetch(
          `${API_URL}/oauth/${provider}/callback?code=${code}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          window.opener?.postMessage(
            {
              type: "oauth_callback",
              error: data.detail || "OAuth authentication failed",
            },
            window.location.origin
          );
          return;
        }

        // Send success back to parent window
        window.opener?.postMessage(
          {
            type: "oauth_callback",
            token: data.token,
            user: data.user,
          },
          window.location.origin
        );
      } catch (err) {
        window.opener?.postMessage(
          {
            type: "oauth_callback",
            error: err.message || "OAuth callback failed",
          },
          window.location.origin
        );
      }
    };

    handleCallback();
  }, [code, error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
      <div className="rounded-lg bg-white p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-foreground">
          Authenticating...
        </h1>
        <p className="mt-2 text-muted">
          Please wait while we complete your authentication.
        </p>
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-gray-200">
          <div className="h-full w-1/3 animate-pulse bg-primary"></div>
        </div>
      </div>
    </div>
  );
}
