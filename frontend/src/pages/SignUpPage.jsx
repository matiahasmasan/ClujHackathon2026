import { Link } from "react-router-dom";
import logo from "../assets/intouch-logo.png";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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
                required
              />
              <Input
                label="Last Name"
                type="text"
                name="lastName"
                placeholder="Doe"
                icon={UserIcon}
                autoComplete="family-name"
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
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              placeholder="+1 (555) 000-0000"
              icon={PhoneIcon}
              autoComplete="tel"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a password"
              icon={LockIcon}
              autoComplete="new-password"
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

            <Button type="submit" className="mt-2 w-full rounded-xl py-3.5">
              Sign Up
            </Button>
          </form>

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
