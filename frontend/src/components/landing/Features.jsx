import FeatureCard from "./FeatureCard";

const features = [
  {
    number: 1,
    title: "One-Touch SOS",
    description:
      "Instant alerts to your care circle with location sharing. Help arrives when it matters most.",
    accent: "primary",
  },
  {
    number: 2,
    title: "Daily Vitals Sync",
    description:
      "Automatic health data sharing with family and caregivers. Stay informed without the hassle.",
    accent: "secondary",
  },
  {
    number: 3,
    title: "Video Check-ins",
    description:
      "Simple, one-tap video calls designed for seniors. See your loved ones face-to-face, anytime.",
    accent: "primary",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="scroll-anchor bg-surface px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-14">
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            Care simplified for everyone
          </h2>
          <p className="mt-3 text-base text-muted sm:mt-4 sm:text-lg">
            Designed specifically for those who need technology to be invisible,
            not intimidating.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => (
            <FeatureCard key={feature.number} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
}
