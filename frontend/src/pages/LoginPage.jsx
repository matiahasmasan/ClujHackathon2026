import { Link } from "react-router-dom";
import logo from "../assets/intouch-logo.png";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <div className="flex min-h-screen flex-col px-4 py-10 sm:py-14">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center">
        <Link to="/" className="shrink-0">
          <img src={logo} alt="inTouch" className="h-24 w-auto" />
        </Link>

        <div className="mt-8 w-full rounded-2xl border border-border/50 bg-white p-6 shadow-lg shadow-foreground/5 sm:p-8">
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
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Enter your password"
              icon={LockIcon}
              autoComplete="current-password"
              required
            />
            <Button type="submit" className="mt-2 w-full rounded-xl py-3.5">
              Log In
            </Button>
          </form>

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
    </div>
  );
}
