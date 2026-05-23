import { Link, NavLink } from "react-router-dom";
import logo from "../../assets/intouch-logo.png";
import { clearAuth } from "../../lib/auth";

const navItems = [{ label: "Users", to: "/admin", icon: "users", end: true }];

function NavIcon({ name }) {
  const icons = {
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
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
      {icons[name]}
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
        <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          Admin
        </span>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-3" aria-label="Admin">
        <ul className="space-y-1 pb-3">
          {navItems.map((item) => (
            <li key={item.label}>
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
            </li>
          ))}
        </ul>
      </nav>

      <div className="shrink-0 space-y-3 border-t border-border/40 p-4">
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

export default function AdminSidebar({ open = false, onClose }) {
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
