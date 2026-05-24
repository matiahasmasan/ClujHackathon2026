import { useEffect, useState } from "react";

import { fetchFeaturedReview } from "../../lib/api";
import { getInitials } from "../../lib/auth";

const FALLBACK = {
  rating: 5,
  body:
    "inTouch has completely changed how we care for my father. I no longer wake up in a panic wondering if he\u2019s okay. The app is so simple he actually uses it.",
  user_first_name: "Sarah",
  user_last_name: "Jenkins",
};

function Stars({ rating = 5 }) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div
      className="flex gap-1 text-primary-foreground/90"
      aria-label={`${safeRating} out of 5 stars`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className={`size-5 ${i < safeRating ? "fill-current" : "fill-current opacity-30"}`}
          viewBox="0 0 20 20"
          aria-hidden
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function Testimonial() {
  const [review, setReview] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetchFeaturedReview()
      .then((data) => {
        if (!cancelled && data) setReview(data);
      })
      .catch(() => {
        // Silently fall back to the static testimonial on any failure.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const display = review ?? FALLBACK;
  const fullName = `${display.user_first_name ?? ""} ${display.user_last_name ?? ""}`.trim();
  const initials = getInitials(display.user_first_name, display.user_last_name);
  const body = display.body?.trim() || FALLBACK.body;

  return (
    <section
      id="how-it-works"
      className="scroll-anchor px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <blockquote className="rounded-2xl bg-primary px-5 py-8 text-primary-foreground shadow-xl shadow-primary/20 sm:rounded-3xl sm:px-12 sm:py-16 lg:px-16">
          <Stars rating={display.rating} />
          <p className="mt-5 text-lg font-medium leading-snug sm:mt-6 sm:text-2xl lg:text-[2rem] lg:leading-snug">
            &ldquo;{body}&rdquo;
          </p>
          <footer className="mt-10 flex items-center gap-4">
            <div
              aria-label={fullName || "Caregiver"}
              className="flex size-14 items-center justify-center rounded-full bg-primary-foreground/15 text-base font-semibold uppercase tracking-wide ring-2 ring-primary-foreground/30"
            >
              {initials}
            </div>
            <div>
              <cite className="not-italic text-lg font-semibold">
                {fullName || "Anonymous Caregiver"}
              </cite>
              <p className="text-sm text-primary-foreground/80">
                Caregiver
              </p>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
