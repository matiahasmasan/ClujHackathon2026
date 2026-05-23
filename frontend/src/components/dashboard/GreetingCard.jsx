import Button from "../ui/Button";

export default function GreetingCard() {
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
          Good morning, Sarah.
        </h1>
        <p className="mt-2 text-sm text-muted sm:text-base">
          Here&apos;s the latest from your circle. 4 loved ones checked in, 4 of
          7 medications taken today.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="px-5 py-2.5 text-sm">Start a wellness call</Button>
          <Button variant="outline" className="bg-white/80 px-5 py-2.5 text-sm">
            View today&apos;s schedule
          </Button>
        </div>
      </div>
    </section>
  );
}
