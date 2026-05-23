export default function AppBackground() {
  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream"
      aria-hidden
    >
      <div className="absolute -left-[15%] top-[6%] size-[min(520px,70vw)] rounded-full bg-primary/20 blur-[100px] sm:blur-[120px]" />
      <div className="absolute -right-[12%] top-[14%] size-[min(480px,65vw)] rounded-full bg-secondary/18 blur-[90px] sm:blur-[110px]" />
      <div className="absolute -bottom-[18%] left-[20%] size-[min(560px,75vw)] rounded-full bg-primary/15 blur-[110px] sm:blur-[130px]" />
      <div className="absolute right-[10%] top-[50%] size-[min(400px,52vw)] rounded-full bg-secondary/14 blur-[80px] sm:blur-[100px]" />
    </div>
  );
}
