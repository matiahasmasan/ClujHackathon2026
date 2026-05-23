import Button from "../ui/Button";

export default function DashboardHeader() {
  return (
    <header className="flex flex-col gap-4 border-b border-border/40 bg-white/50 px-4 py-4 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:border-b-0">
      <div className="order-1 flex items-center justify-between gap-3 sm:order-2 sm:justify-end">
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="relative inline-flex size-10 items-center justify-center rounded-full border border-border/60 bg-white text-muted transition-colors hover:text-foreground"
            aria-label="Notifications"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            <span className="absolute top-2 right-2 size-2 rounded-full bg-red-500" />
          </button>
          <Button className="px-4 py-2 text-sm">+ Add senior</Button>
        </div>

        <div className="flex items-center gap-3 sm:border-l sm:border-border/60 sm:pl-4">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            SJ
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-foreground">Sarah Jenkins</p>
            <p className="text-xs text-muted">Primary Caregiver</p>
          </div>
        </div>
      </div>

      <label className="relative order-2 block w-full max-w-xl sm:order-1 sm:flex-1">
        <span className="sr-only">Search</span>
        <svg
          className="pointer-events-none absolute top-1/2 left-3.5 size-5 -translate-y-1/2 text-muted"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="search"
          placeholder="Search seniors, medications..."
          className="w-full rounded-full border border-border/60 bg-white py-2.5 pr-4 pl-11 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </label>
    </header>
  );
}
