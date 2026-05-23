import avatarSarah from "../../assets/avatar-sarah.jpg";

function Stars() {
  return (
    <div className="flex gap-1 text-primary-foreground/90" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          className="size-5 fill-current"
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
  return (
    <section
      id="how-it-works"
      className="scroll-anchor px-4 py-14 sm:px-6 sm:py-20 lg:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <blockquote className="rounded-2xl bg-primary px-5 py-8 text-primary-foreground shadow-xl shadow-primary/20 sm:rounded-3xl sm:px-12 sm:py-16 lg:px-16">
          <Stars />
          <p className="mt-5 text-lg font-medium leading-snug sm:mt-6 sm:text-2xl lg:text-[2rem] lg:leading-snug">
            &ldquo;inTouch has completely changed how we care for my father. I no
            longer wake up in a panic wondering if he&apos;s okay. The app is so
            simple he actually uses it.&rdquo;
          </p>
          <footer className="mt-10 flex items-center gap-4">
            <img
              src={avatarSarah}
              alt="Sarah Jenkins"
              className="size-14 rounded-full object-cover ring-2 ring-primary-foreground/30"
            />
            <div>
              <cite className="not-italic text-lg font-semibold">Sarah Jenkins</cite>
              <p className="text-sm text-primary-foreground/80">
                Daughter &amp; Primary Caregiver
              </p>
            </div>
          </footer>
        </blockquote>
      </div>
    </section>
  );
}
