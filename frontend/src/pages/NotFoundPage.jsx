import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/intouch-logo.png";
import Button from "../components/ui/Button";

export default function NotFoundPage() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <Link to="/" className="mb-10 shrink-0">
        <img src={logo} alt="inTouch" className="h-28 w-auto" />
      </Link>

      <div className="w-full max-w-lg rounded-2xl bg-card/75 p-8 text-center shadow-sm backdrop-blur-sm sm:p-10">
        <p className="text-7xl font-bold tracking-tight text-foreground sm:text-8xl">
          404
        </p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          Page not found
        </h1>
        <p className="mt-3 text-muted">
          We couldn&apos;t find a page at{" "}
          <code className="rounded-lg bg-surface px-2 py-0.5 text-sm font-medium text-foreground ring-1 ring-border/60">
            {location.pathname}
          </code>
          . It may have been moved or doesn&apos;t exist.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button to="/" className="w-full sm:w-auto">
            Back to home
          </Button>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
        </div>

        <p className="mt-6 text-sm text-muted">
          Looking for your account?{" "}
          <Link
            to="/login"
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
