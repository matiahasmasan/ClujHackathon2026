import heroImage from "../../assets/hero-elder.jpg";
import Button from "../ui/Button";

export default function Hero() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:py-24">
      <div className="grid items-center gap-8 sm:gap-12 lg:grid-cols-2 lg:gap-16">
        <div className="flex flex-col gap-4 sm:gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-secondary/10 px-4 py-1.5 text-sm font-medium text-secondary">
            <span className="size-2 rounded-full bg-secondary" aria-hidden />
            Trusted by 10,000+ Families
          </span>

          <h1 className="text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl lg:text-[3.25rem] lg:leading-[1.15]">
            Connection is the{" "}
            <span className="bg-linear-to-r from-primary to-secondary bg-clip-text text-transparent">
              best medicine.
            </span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            The simple, reliable way to stay connected with elders and loved
            ones facing health challenges. Peace of mind for families, dignity
            for seniors.
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap sm:gap-4 sm:pt-2">
            <Button to="/login" className="w-full sm:w-auto">Set up a Circle</Button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute -inset-4 rounded-3xl bg-linear-to-br from-primary/10 to-secondary/10 blur-2xl" />
          <img
            src={heroImage}
            alt="Elderly woman smiling while on a video call with family on her tablet"
            className="relative max-h-72 w-full rounded-2xl object-cover shadow-xl shadow-primary/10 ring-1 ring-border/50 sm:max-h-none sm:rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}
