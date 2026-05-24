import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/intouch-logo.png";
import GoogleSignInButton from "../components/auth/GoogleSignInButton";
import TwoFactorModal from "../components/auth/TwoFactorModal";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { login } from "../lib/api";
import { saveUser } from "../lib/auth";

function MailIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon({ className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(
    location.state?.sessionExpired
      ? "Your session expired. Please sign in again."
      : "",
  );
  const [loading, setLoading] = useState(false);
  // Holds the LoginResponse after a correct password, while we show the 2FA
  // step. Set to null when no 2FA is in progress.
  const [pendingLogin, setPendingLogin] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login({ email, password });
      // Password is valid — show the (simulated) 2FA step before finishing.
      setPendingLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Called once the 2FA modal accepts a 6-digit code: complete the login.
  const completeLogin = () => {
    if (!pendingLogin) return;
    localStorage.setItem("access_token", pendingLogin.access_token);
    saveUser(pendingLogin);
    setPendingLogin(null);
    const defaultDest = pendingLogin.role === "admin" ? "/admin" : "/dashboard";
    navigate(location.state?.from?.pathname ?? defaultDest, { replace: true });
  };

  return (
    <div className="flex min-h-screen flex-col px-4 py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="inTouch" className="h-28 w-auto" />
        </Link>

        <div className="mt-8 w-full rounded-2xl border border-border/50 bg-card p-6 shadow-lg shadow-foreground/5 sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Log in</h1>
          <p className="mt-1 text-sm text-muted">
            Welcome back. Enter your details to continue.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <Input
              label="Email Address"
              type="email"
              name="email"
              placeholder="you@example.com"
              icon={MailIcon}
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              icon={LockIcon}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
                {error}
              </p>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 w-full rounded-xl py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Logging in…" : "Log In"}
            </Button>
          </form>

          <GoogleSignInButton onError={setError} text="signin_with" />

          <p className="mt-6 text-center text-sm text-muted">
            Don&apos;t have an account?{" "}
            <Link
              to="/signup"
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              Sign Up
            </Link>
          </p>
        </div>

        <footer className="mt-8 flex items-center gap-2 text-sm text-muted">
          <a href="#" className="transition-colors hover:text-foreground">
            Privacy Policy
          </a>
          <span aria-hidden>·</span>
          <a href="#" className="transition-colors hover:text-foreground">
            Terms of Service
          </a>
        </footer>
      </div>

      <TwoFactorModal
        open={pendingLogin !== null}
        email={pendingLogin?.email ?? email}
        onVerify={completeLogin}
        onClose={() => setPendingLogin(null)}
      />
    </div>
  );
}
