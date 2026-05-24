export default function FeatureCard({ number, title, description, accent = "primary" }) {
  const accentStyles = {
    primary: "bg-primary/10 text-primary group-hover:bg-primary/15",
    secondary: "bg-secondary/10 text-secondary group-hover:bg-secondary/15",
  };

  const titleHoverStyles = {
    primary: "group-hover:text-primary",
    secondary: "group-hover:text-secondary",
  };

  return (
    <article className="group flex flex-col gap-3 rounded-2xl bg-card/75 p-6 shadow-sm backdrop-blur-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:ring-1 hover:ring-primary/20 motion-reduce:hover:translate-y-0 dark:hover:shadow-md dark:hover:shadow-none dark:hover:ring-primary/10 sm:gap-4 sm:p-8">
      <span
        className={`flex size-10 items-center justify-center rounded-full text-sm font-bold transition-transform duration-300 group-hover:scale-105 ${accentStyles[accent]}`}
      >
        {number}
      </span>
      <h3
        className={`text-xl font-bold text-foreground transition-colors duration-300 ${titleHoverStyles[accent]}`}
      >
        {title}
      </h3>
      <p className="leading-relaxed text-muted">{description}</p>
    </article>
  );
}
