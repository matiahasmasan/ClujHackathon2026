import { useState } from "react";
import { getStoredTheme, setTheme } from "../../lib/theme";

function SunIcon() {
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
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
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
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function ThemeToggle() {
  const [theme, setLocalTheme] = useState(getStoredTheme);

  function choose(next) {
    if (next === theme) return;
    setTheme(next);
    setLocalTheme(next);
  }

  const baseBtn =
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";
  const active = "bg-card text-foreground shadow-sm";
  const inactive = "text-muted hover:text-foreground";

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex rounded-xl border border-border bg-surface p-1"
    >
      <button
        type="button"
        role="radio"
        aria-checked={theme === "light"}
        onClick={() => choose("light")}
        className={`${baseBtn} ${theme === "light" ? active : inactive}`}
      >
        <SunIcon />
        Light
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={theme === "dark"}
        onClick={() => choose("dark")}
        className={`${baseBtn} ${theme === "dark" ? active : inactive}`}
      >
        <MoonIcon />
        Dark
      </button>
    </div>
  );
}
