import { Link } from "react-router-dom";
import logo from "../../assets/intouch-logo.png";
import { clearAuth } from "../../lib/auth";
const navItems = [
  { label: "Overview", href: "/dashboard", icon: "grid", active: true },
  { label: "Seniors", href: "#", icon: "users" },
  { label: "Medications", href: "#", icon: "pill" },
  { label: "Wellness Calls", href: "#", icon: "phone" },
  { label: "Alerts", href: "#", icon: "alert" },
  { label: "Settings", href: "#", icon: "settings" },
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

export default function DashboardSidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border/40 bg-white/60 backdrop-blur-sm lg:flex">
      <div className="shrink-0 px-5 py-4">
        <Link to="/">
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
              <a
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  item.active
                    ? "bg-primary text-primary-foreground"
                    : "text-muted hover:bg-white/80 hover:text-foreground"
                }`}
              >
                <NavIcon name={item.icon} />
                {item.label}
              </a>
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
          className="block px-3 text-sm font-medium text-muted transition-colors hover:text-foreground"
          onClick={clearAuth}
        >
          Sign out
        </Link>
      </div>
    </aside>
  );
}
