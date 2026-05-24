import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/intouch-logo.png";
import Button from "../ui/Button";

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Reviews", href: "#how-it-works" },
];

function scrollToSection(href, onDone) {
  const id = href.replace(/^#/, "");
  const target = document.getElementById(id);
  if (!target) return false;

  target.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", href);
  onDone?.();
  return true;
}

function handleNavClick(event, href, onDone) {
  if (!href.startsWith("#")) return;
  event.preventDefault();
  scrollToSection(href, onDone);
}

function MenuIcon({ open }) {
  return (
    <svg
      className="size-6"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </>
      ) : (
        <>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </>
      )}
    </svg>
  );
}

function LogInIcon() {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  return (
    <header className="sticky top-0 z-50 bg-cream/70 backdrop-blur-md">
      <div className="relative mx-auto flex h-28 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center" onClick={closeMenu}>
          <img src={logo} alt="inTouch" className="h-28 w-auto" />
        </Link>

        <nav className="hidden items-center gap-6 md:flex" aria-label="Main">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-foreground"
              onClick={(event) => handleNavClick(event, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 md:flex">
            <Button
              to="/login"
              variant="outline"
              className="gap-2 px-4 py-2 text-sm"
            >
              <LogInIcon />
              Log In
            </Button>
            <Button className="px-4 py-2 text-sm">Get Started</Button>
          </div>

          <button
            type="button"
            className="inline-flex size-10 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-surface md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((prev) => !prev)}
          >
            <MenuIcon open={open} />
          </button>
        </div>

        {open && (
          <>
            <button
              type="button"
              className="fixed inset-0 top-24 z-40 bg-foreground/10 md:hidden"
              aria-label="Close menu"
              onClick={closeMenu}
            />
            <nav
              id="mobile-nav"
              className="absolute inset-x-0 top-full z-50 max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain border-t border-border bg-card px-4 py-3 shadow-lg md:hidden"
              aria-label="Mobile"
            >
              <ul className="flex flex-col gap-1">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="block rounded-lg px-3 py-2.5 text-base font-medium text-foreground transition-colors hover:bg-surface"
                      onClick={(event) =>
                        handleNavClick(event, link.href, closeMenu)
                      }
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
                <Button
                  to="/login"
                  variant="outline"
                  className="w-full gap-2 py-2.5 text-sm"
                  onClick={closeMenu}
                >
                  <LogInIcon />
                  Log In
                </Button>
                <Button className="w-full py-2.5 text-sm" onClick={closeMenu}>
                  Get Started
                </Button>
              </div>
            </nav>
          </>
        )}
      </div>
    </header>
  );
}
