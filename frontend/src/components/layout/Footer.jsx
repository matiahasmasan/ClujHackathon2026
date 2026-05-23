import logo from "../../assets/intouch-logo.png";

const productLinks = [
  "For Seniors",
  "For Families",
  "App Features",
  "Security",
];

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
    <footer
      id="for-families"
      className="scroll-anchor border-t border-border bg-white px-4 py-12 sm:px-6 sm:py-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 sm:gap-12 lg:grid-cols-4">
          <div className="sm:col-span-2 lg:col-span-2">
            <img src={logo} alt="inTouch" className="h-8 w-auto" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted">
              Empowering independent living through thoughtful technology and
              human connection.
            </p>
          </div>

          <LinkColumn title="Product" links={productLinks} />
          <LinkColumn title="Support" links={supportLinks} />
        </div>

        <p className="mt-12 border-t border-border pt-8 text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} inTouch Health Technologies. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}
