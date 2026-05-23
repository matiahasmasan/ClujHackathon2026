export default function Input({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  className = "",
  ...props
}) {
  const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={className}>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-semibold text-foreground"
      >
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        )}
        <input
          id={inputId}
          type={type}
          placeholder={placeholder}
          className={`w-full rounded-xl border border-border bg-white py-3 text-sm text-foreground transition-colors placeholder:text-muted/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${Icon ? "pl-11 pr-4" : "px-4"}`}
          {...props}
        />
      </div>
    </div>
  );
}
