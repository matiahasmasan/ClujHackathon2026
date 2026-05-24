import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Button from "../ui/Button";

const STORAGE_KEY = "intouch_privacy_consent";

function readStoredConsent() {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function writeStoredConsent(value) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // localStorage unavailable (e.g. private mode) — silently ignore.
  }
}

function ShieldIcon() {
  return (
    <svg
      className="size-6 text-primary"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      className="size-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

export default function PrivacyConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (readStoredConsent()) return;
    setMounted(true);
    const id = window.setTimeout(() => setVisible(true), 250);
    return () => window.clearTimeout(id);
  }, []);

  if (!mounted) return null;

  const dismiss = (decision) => {
    writeStoredConsent(decision);
    setVisible(false);
    window.setTimeout(() => setMounted(false), 300);
  };

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="privacy-consent-title"
      aria-describedby="privacy-consent-body"
      className={`fixed inset-x-0 bottom-0 z-60 flex justify-center px-4 pb-4 transition-all duration-300 sm:px-6 sm:pb-6 ${
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-6 opacity-0"
      }`}
    >
      <div className="w-full max-w-3xl rounded-2xl border border-border/60 bg-card p-5 shadow-2xl shadow-foreground/10 ring-1 ring-border/30 backdrop-blur sm:p-6">
        <div className="flex items-start gap-4">
          <div className="hidden size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:flex">
            <ShieldIcon />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <h2
                id="privacy-consent-title"
                className="text-base font-semibold text-foreground sm:text-lg"
              >
                Your privacy matters
              </h2>
              <button
                type="button"
                onClick={() => dismiss("dismissed")}
                aria-label="Dismiss privacy notice"
                className="-mr-1 -mt-1 inline-flex size-8 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
              >
                <CloseIcon />
              </button>
            </div>

            <p
              id="privacy-consent-body"
              className="mt-2 text-sm leading-relaxed text-muted"
            >
              inTouch processes personal and health-related data to coordinate
              care for your loved ones. By continuing, you agree to our use of
              essential session cookies and the processing described in our
              Privacy Policy, in line with the GDPR.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <Link
                to="/privacy"
                className="order-1 self-center text-sm font-semibold text-primary transition-colors hover:underline sm:order-1 sm:mr-auto"
              >
                Read full policy
              </Link>
              <Button
                variant="outline"
                className="order-3 w-full px-5 py-2.5 sm:order-2 sm:w-auto"
                onClick={() => dismiss("declined")}
              >
                Decline
              </Button>
              <Button
                variant="primary"
                className="order-2 w-full px-5 py-2.5 sm:order-3 sm:w-auto"
                onClick={() => dismiss("accepted")}
              >
                Accept
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
