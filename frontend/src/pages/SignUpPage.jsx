import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/intouch-logo.png";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { login, register } from "../lib/api";
import { saveUser } from "../lib/auth";

function UserIcon({ className }) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

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

function PhoneIcon({ className }) {
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
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
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

export default function SignUpPage() {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOAuthClick = async (provider) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";
      
      // Get OAuth redirect URL from backend
      const response = await fetch(`${API_URL}/oauth/${provider.toLowerCase()}/login`);
      const data = await response.json();
      
      if (data.redirect_url) {
        // Open OAuth login in popup
        const width = 500;
        const height = 600;
        const left = window.screenX + (window.outerWidth - width) / 2;
        const top = window.screenY + (window.outerHeight - height) / 2;
        
        const popup = window.open(
          data.redirect_url,
          `${provider}Signup`,
          `width=${width},height=${height},left=${left},top=${top}`
        );
        
        // Listen for messages from popup
        const handleMessage = (event) => {
          if (event.data.type === 'oauth_callback') {
            const { token, user } = event.data;
            
            if (token && user) {
              localStorage.setItem("access_token", token);
              localStorage.setItem("user", JSON.stringify(user));
              navigate("/dashboard");
            } else if (event.data.error) {
              setError(event.data.error);
            }
            
            if (popup) popup.close();
            window.removeEventListener('message', handleMessage);
          }
        };
        
        window.addEventListener('message', handleMessage);
      }
    } catch (err) {
      setError(`${provider} OAuth failed: ${err.message}`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register({
        first_name: firstName,
        last_name: lastName,
        email,
        password,
        phone_number: phone,
      });
      // Better Auth returns token in data.token and user in data.user
      const data = await login({ email, password });
      localStorage.setItem("access_token", data.token);
      saveUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col px-4 py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="inTouch" className="h-24 w-auto" />
        </Link>

        <div className="mt-8 w-full rounded-2xl border border-border/50 bg-white p-6 shadow-lg shadow-foreground/5 sm:p-8">
          <h1 className="text-2xl font-bold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted">
            Join inTouch and stay connected with your care circle.
          </p>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="First Name"
                type="text"
                name="firstName"
                placeholder="Jane"
                icon={UserIcon}
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Doe"
                icon={UserIcon}
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

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
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              icon={PhoneIcon}
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a password"
              icon={LockIcon}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                name="agree"
                required
                className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus:ring-primary/20"
              />
              <span className="text-sm leading-relaxed text-muted">
                I agree to the{" "}
                <a
                  href="#"
                  className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="#"
                  className="font-medium text-foreground underline-offset-2 hover:text-primary hover:underline"
                >
                  Privacy Policy
                </a>
                .
              </span>
            </label>

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
              {loading ? "Creating account…" : "Sign Up"}
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/40" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-muted">Or sign up with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthClick("Google")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-gray-50"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuthClick("GitHub")}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-border/60 bg-white px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-gray-50"
              >
                <svg
                  className="size-5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
                <span>GitHub</span>
              </button>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-semibold text-foreground transition-colors hover:text-primary"
            >
              Log In
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
    </div>
  );
}
