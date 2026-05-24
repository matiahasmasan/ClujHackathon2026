import { Link } from "react-router-dom";
import heroImage from "../../assets/hero-elder.jpg";
import handsImage from "../../assets/hero-hands.jpg";

function PlayIcon() {
  return (
    <svg className="size-4 fill-primary" viewBox="0 0 24 24" aria-hidden>
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.04-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14Z" />
    </svg>
  );
}

function StatusIcon() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-secondary/15">
      <span className="size-2 rounded-full bg-secondary ring-4 ring-secondary/20" />
    </span>
  );
}

function ClockIcon() {
  return (
    <span className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary-foreground/15">
      <svg
        className="size-4 text-primary-foreground"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    </span>
  );
}

function HandDrawnUnderline() {
  return (
    <svg
      className="pointer-events-none absolute -bottom-1 left-0 w-full sm:-bottom-1.5"
      viewBox="0 0 180 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M2 8C28 3 52 2 90 6C118 9 148 8 178 4"
        stroke="#25be5f"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function scrollToDemo(event) {
  event.preventDefault();
  const target = document.getElementById("features");
  target?.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", "#features");
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-16 lg:max-h-[calc(100dvh-var(--header-height))]">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[420px] bg-[radial-gradient(ellipse_at_top,rgba(1,125,240,0.12)_0%,transparent_68%)]"
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-16 size-56 rounded-full bg-secondary/10 blur-3xl"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col justify-center px-4 py-8 sm:px-6 sm:py-10 lg:h-[calc(100dvh-var(--header-height))] lg:max-h-[calc(100dvh-var(--header-height))] lg:py-6">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] lg:gap-10">
          <div className="flex flex-col gap-4 sm:gap-5">
            <span className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted shadow-sm">
              <span className="size-2 rounded-full bg-secondary" aria-hidden />
              Trusted by 10,000+ families
            </span>

            <h1 className="max-w-xl text-[1.85rem] font-bold leading-[1.12] tracking-tight text-primary sm:text-4xl lg:text-[2.65rem] xl:text-[2.85rem]">
              Connection is{" "}
              <span className="relative inline-block whitespace-nowrap">
                the best
                <HandDrawnUnderline />
              </span>{" "}
              medicine.
            </h1>

            <p className="max-w-md text-sm leading-relaxed text-muted sm:text-base lg:max-w-lg">
              The simple, reliable way to stay connected with elders and loved
              ones. Peace of mind for you, independence for them.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
              <Link
                to="/login"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-linear-to-b from-primary to-[#3d9ef7] px-6 py-3 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:-translate-y-0.5 sm:w-auto"
              >
                Set up a Circle
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm lg:max-w-none lg:pl-2">
            <div className="relative">
              <div
                aria-hidden
                className="absolute -inset-2 rounded-4xl bg-linear-to-br from-primary/15 via-transparent to-secondary/10 blur-2xl"
              />

              <img
                src={heroImage}
                alt="Elderly woman smiling while on a video call with family on her tablet"
                className="relative aspect-4/5 max-h-[min(22rem,calc(100dvh-var(--header-height)-10rem))] w-full rounded-3xl object-cover shadow-2xl shadow-primary/15 ring-1 ring-border/40 sm:max-h-[min(24rem,calc(100dvh-var(--header-height)-8rem))] lg:aspect-auto lg:max-h-[min(26rem,calc(100dvh-var(--header-height)-4rem))] lg:min-h-[18rem]"
              />

              <div className="hero-float absolute -left-2 top-5 max-w-44 rounded-2xl border border-border/60 bg-card/95 p-2.5 shadow-xl backdrop-blur-sm sm:-left-5 sm:top-8 sm:max-w-none sm:p-3">
                <div className="flex items-center gap-2.5">
                  <StatusIcon />
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      Mom is on call
                    </p>
                    <p className="text-xs text-muted">Healthy vitals today</p>
                  </div>
                </div>
              </div>

              <div className="hero-float-delay absolute -right-1 bottom-12 max-w-40 rounded-2xl bg-primary px-3 py-2.5 shadow-xl shadow-primary/30 sm:-right-3 sm:bottom-14 sm:max-w-none">
                <div className="flex items-center gap-2.5">
                  <ClockIcon />
                  <div>
                    <p className="text-sm font-semibold text-primary-foreground">
                      Weekly Circle
                    </p>
                    <p className="text-xs text-primary-foreground/75">
                      Starting in 15 mins
                    </p>
                  </div>
                </div>
              </div>

              <img
                src={handsImage}
                alt=""
                aria-hidden
                className="hero-float-slow absolute -bottom-3 -left-2 size-20 rounded-2xl object-cover shadow-xl ring-4 ring-cream sm:-bottom-4 sm:-left-4 sm:size-28 lg:-bottom-5 lg:-left-5 lg:size-32"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
