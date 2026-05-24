import { useRef, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import { maskEmail } from "../../lib/auth";

const LENGTH = 6;
const EMPTY = Array(LENGTH).fill("");

/**
 * Simulated 2FA step. Shows a masked email and a segmented 6-box OTP field
 * with auto-advance, backspace and paste support. Any 6-digit code is
 * accepted — there is no real verification — and on submit it calls
 * onVerify() so the parent can finish logging the user in.
 */
export default function TwoFactorModal({ open, email, onVerify, onClose }) {
  const [digits, setDigits] = useState(EMPTY);
  const [error, setError] = useState("");
  const inputsRef = useRef([]);

  const focusBox = (index) => {
    inputsRef.current[index]?.focus();
    inputsRef.current[index]?.select();
  };

  const handleChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1); // last typed digit only
    if (!digit && value !== "") return;
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (error) setError("");
    if (digit && index < LENGTH - 1) focusBox(index + 1);
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      const next = [...digits];
      if (next[index]) {
        next[index] = "";
        setDigits(next);
      } else if (index > 0) {
        next[index - 1] = "";
        setDigits(next);
        focusBox(index - 1);
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      focusBox(index - 1);
    } else if (event.key === "ArrowRight" && index < LENGTH - 1) {
      focusBox(index + 1);
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();
    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, LENGTH);
    if (!pasted) return;
    const next = [...EMPTY];
    for (let i = 0; i < pasted.length; i += 1) next[i] = pasted[i];
    setDigits(next);
    if (error) setError("");
    focusBox(Math.min(pasted.length, LENGTH - 1));
  };

  const code = digits.join("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (code.length !== LENGTH) {
      setError("Enter the 6-digit code.");
      return;
    }
    setDigits(EMPTY);
    onVerify();
  };

  return (
    <Modal open={open} onClose={onClose} title="Two-step verification" size="sm">
      <form onSubmit={handleSubmit} className="space-y-5">
        <p className="text-sm text-muted">
          We&apos;ve sent a 6-digit verification code to{" "}
          <span className="font-semibold text-foreground">
            {maskEmail(email)}
          </span>
          . Enter it below to continue.
        </p>

        <div>
          <div className="flex justify-between gap-2" onPaste={handlePaste}>
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputsRef.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                autoFocus={index === 0}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onFocus={(e) => e.target.select()}
                aria-label={`Digit ${index + 1}`}
                className="h-14 w-full rounded-xl border border-border bg-card text-center text-2xl font-semibold text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            ))}
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>

        <Button
          type="submit"
          className="w-full rounded-xl py-3.5 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={code.length !== LENGTH}
        >
          Verify
        </Button>

        <p className="text-center text-sm text-muted">
          Didn&apos;t get the code?{" "}
          <button
            type="button"
            onClick={() => {
              setDigits(EMPTY);
              setError("");
              focusBox(0);
            }}
            className="font-semibold text-foreground transition-colors hover:text-primary"
          >
            Resend
          </button>
        </p>
      </form>
    </Modal>
  );
}
