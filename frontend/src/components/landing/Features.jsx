import FeatureCard from "./FeatureCard";

const features = [
  {
    number: 1,
    title: "Automated Wellness Calls",
    description:
      "Scheduled AI-powered calls check in with seniors at specific times and days, creating a consistent and comforting routine.",
    accent: "primary",
  },
  {
    number: 2,
    title: "Medication Reminders",
    description:
      "Friendly voice reminders help users stay on track with their medications, reducing missed doses and supporting daily care.",
    accent: "secondary",
  },
  {
    number: 3,
    title: "Health & Emergency Monitoring",
    description:
      "The assistant asks simple health questions during each call and can quickly alert caregivers if an emergency or unusual response is detected.",
    accent: "primary",
  },
];

export default function Features() {
  return (
    <section
      id="features"
      className="scroll-anchor px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
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
