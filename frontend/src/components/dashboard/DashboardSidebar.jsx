import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/intouch-logo.png";
import { clearAuth } from "../../lib/auth";

const navItems = [
  { label: "Overview", to: "/dashboard", icon: "grid", end: true },
  { label: "Seniors", to: "/dashboard/seniors", icon: "users" },
  { label: "Medications", to: "/dashboard/medications", icon: "pill" },
  { label: "Wellness Calls", to: "/dashboard/calls", icon: "phone" },
  { label: "Care Ledger", to: "/dashboard/ledger", icon: "ledger" },
  { label: "Settings", to: "/dashboard/settings", icon: "settings" },
];

function NavIcon({ name }) {
  const icons = {
    grid: (
      <path d="M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z" />
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    pill: (
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
    ),
    ledger: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M9 7h7M9 11h7" />
      </>
    ),
    phone: (
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    ),
    alert: (
      <>
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4M12 17h.01" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </>
    ),
  };

  return (
    <svg
      className="size-5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {name === "grid" ? (
        <g fill="currentColor" stroke="none">
          {icons.grid}
        </g>
      ) : (
        icons[name]
      )}
    </svg>
  );
}

function SidebarContent({ onNavigate }) {
  return (
    <>
      <div className="shrink-0 px-5 py-4">
        <Link to="/" onClick={onNavigate}>
          <img src={logo} alt="inTouch" className="h-24 w-auto" />
        </Link>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3"
        aria-label="Dashboard"
      >
        <ul className="space-y-1 pb-3">
          {navItems.map((item) => (
            <li key={item.label}>
              {item.to.startsWith("/") ? (
                <NavLink
                  to={item.to}
                  end={item.end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted hover:bg-white/80 hover:text-foreground"
                    }`
                  }
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </NavLink>
              ) : (
                <a
                  href={item.to}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/80 hover:text-foreground"
                >
                  <NavIcon name={item.icon} />
                  {item.label}
                </a>
              )}
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 space-y-3 border-t border-border/40 p-4">
        <div className="rounded-2xl bg-linear-to-br from-primary to-secondary p-4 text-primary-foreground">
          <p className="text-sm font-semibold">Need help?</p>
          <p className="mt-1 text-xs text-primary-foreground/85">
            Our care team is here for you.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-xl bg-white/20 px-3 py-2 text-xs font-semibold backdrop-blur-sm transition-colors hover:bg-white/30"
          >
            Contact support
          </button>
        </div>
        <Link
          to="/login"
          className="flex w-full items-center justify-center rounded-xl border border-border px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface hover:text-foreground"
          onClick={() => {
            onNavigate?.();
            clearAuth();
          }}
        >
          Sign out
        </Link>
      </div>
    </>
  );
}

export default function DashboardSidebar({ open = false, onClose }) {
  const handleNavigate = () => onClose?.();

  return (
    <>
      {/* Desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/40 bg-white/60 backdrop-blur-sm lg:flex lg:flex-col">
        <SidebarContent />
      </aside>

      {/* Mobile overlay */}
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-[2px] lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 max-w-[85vw] flex-col border-r border-border/40 bg-white shadow-xl transition-transform duration-300 ease-out lg:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex size-10 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground"
            aria-label="Close menu"
          >
            <svg
              className="size-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <SidebarContent onNavigate={handleNavigate} />
      </aside>
    </>
  );
}
