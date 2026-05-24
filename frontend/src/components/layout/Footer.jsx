import logo from "../../assets/intouch-logo.png";
import ThemeToggle from "../dashboard/ThemeToggle";

const productLinks = ["For Seniors", "Pricing", "App Features", "Security"];

const supportLinks = [
  "Help Center",
  "Privacy Policy",
  "Contact Us",
  "Accessibility",
];

function LinkColumn({ title, links }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <ul className="mt-4 space-y-3">
        {links.map((label) => (
          <li key={label}>
            <a
              href="#"
              className="text-sm text-muted transition-colors hover:text-foreground"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Footer() {
  return (
    <footer className="scroll-anchor px-4 py-12 sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <img src={logo} alt="inTouch" className="h-28 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Empowering independent living through thoughtful technology and
              human connection.
            </p>
          </div>

          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Support" links={supportLinks} />
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
