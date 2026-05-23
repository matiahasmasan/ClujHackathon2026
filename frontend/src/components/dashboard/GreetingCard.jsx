import Button from "../ui/Button";

export default function GreetingCard({
  firstName,
  seniorCount = 0,
  medsTaken = 0,
  medsTotal = 0,
}) {
  const lovedOnes =
    seniorCount === 1 ? "1 loved one" : `${seniorCount} loved ones`;
  const medsLine =
    medsTotal === 0
      ? "no medications scheduled today"
      : `${medsTaken} of ${medsTotal} medications taken today`;

  return (
    <section className="relative overflow-hidden rounded-2xl bg-linear-to-r from-primary/15 via-secondary/10 to-primary/5 p-6 sm:p-8">
      <div className="pointer-events-none absolute -right-8 -top-8 size-40 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute right-16 bottom-0 size-32 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative max-w-2xl">
        <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 text-xs font-medium text-secondary backdrop-blur-sm">
          <span className="size-2 rounded-full bg-secondary" aria-hidden />
          All systems calm
        </span>
        <h1 className="mt-4 text-2xl font-bold text-foreground sm:text-3xl">
          Good morning, {firstName}.
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Here&apos;s the latest from your circle. {lovedOnes} in your care,{" "}
          {medsLine}.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button to="/dashboard/seniors" className="bg-blue/80 px-5 py-2.5 text-sm">
            View today&apos;s schedule
          </Button>
        </div>
      </div>
    </section>
  );
}
