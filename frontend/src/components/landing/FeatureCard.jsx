export default function FeatureCard({ number, title, description, accent = "primary" }) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary",
    secondary: "bg-secondary/10 text-secondary",
  };

  return (
    <article className="flex flex-col gap-3 rounded-2xl bg-card/75 p-6 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md sm:gap-4 sm:p-8">
      <span
        className={`flex size-10 items-center justify-center rounded-full text-sm font-bold ${accentStyles[accent]}`}
      >
        {number}
      </span>
      <h3 className="text-xl font-bold text-foreground">{title}</h3>
      <p className="leading-relaxed text-muted">{description}</p>
    </article>
  );
}
