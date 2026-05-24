import { Link, useLocation } from "react-router-dom";

import logo from "../../assets/intouch-logo.png";
import ThemeToggle from "../dashboard/ThemeToggle";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Features", hash: "#features" },
  { label: "Pricing", hash: "#pricing" },
  { label: "Reviews", hash: "#how-it-works" },
];

const accountLinks = [
  { label: "Log In", to: "/login" },
  { label: "Sign Up", to: "/signup" },
];

const legalLinks = [{ label: "Privacy Policy", to: "/privacy" }];

const linkClass =
  "text-sm text-muted transition-colors hover:text-foreground";

function FooterLink({ item, onLandingPage }) {
  const { label, to, hash } = item;

  if (hash) {
    const handleClick = (event) => {
      if (!onLandingPage) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      window.history.replaceState(null, "", hash);
    };
    return (
      <a href={`/${hash}`} className={linkClass} onClick={handleClick}>
        {label}
      </a>
    );
  }

  const handleHomeClick = (event) => {
    if (to !== "/" || !onLandingPage) return;
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
    window.history.replaceState(null, "", "/");
  };

  return (
    <Link to={to} className={linkClass} onClick={handleHomeClick}>
      {label}
    </Link>
  );
}

function LinkColumn({ title, links, onLandingPage }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((item) => (
          <li key={item.label}>
            <FooterLink item={item} onLandingPage={onLandingPage} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  const location = useLocation();
  const onLandingPage = location.pathname === "/";

  return (
    <footer className="scroll-anchor px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-1">
            <img
              src={logo}
              alt="inTouch"
              className="h-8 w-auto max-w-[7.5rem] object-contain sm:h-9 sm:max-w-[8.5rem]"
            />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Empowering independent living through thoughtful technology and
              human connection.
            </p>
          </div>

          <LinkColumn
            title="Navigate"
            links={navLinks}
            onLandingPage={onLandingPage}
          />
          <LinkColumn
            title="Account"
            links={accountLinks}
            onLandingPage={onLandingPage}
          />
          <LinkColumn
            title="Legal"
            links={legalLinks}
            onLandingPage={onLandingPage}
          />
        </div>

        <div className="mt-12 flex flex-col items-center gap-6 border-t border-border/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-center text-sm text-muted sm:text-left">
            &copy; {new Date().getFullYear()} inTouch Health Technologies. All
            rights reserved.
          </p>
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <span className="text-xs font-medium text-muted">Appearance</span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
