import { Link } from "react-router-dom";

const variants = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm shadow-primary/25",
  outline:
    "border border-border bg-card text-foreground hover:bg-surface",
};

export default function Button({
  children,
  variant = "primary",
  className = "",
  to,
  type = "button",
  ...props
}) {
  const classes = `inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold transition-colors ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
