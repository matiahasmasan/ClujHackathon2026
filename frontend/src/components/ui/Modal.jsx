import { useEffect, useId } from "react";

const sizes = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  disabled = false,
  size = "md",
  className = "",
  panelClassName = "",
}) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !disabled) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, disabled]);

  if (!open) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center ${className}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px]"
        aria-label="Close dialog"
        onClick={onClose}
        disabled={disabled}
      />

      <div
        className={`relative max-h-[90dvh] w-full overflow-y-auto rounded-2xl bg-white p-6 shadow-xl sm:p-8 ${sizes[size]} ${panelClassName}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-foreground">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-muted">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={disabled}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface hover:text-foreground disabled:opacity-50"
            aria-label="Close"
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

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
