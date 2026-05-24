import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Testimonial from "../components/landing/Testimonial";
import Pricing from "../components/landing/Pricing";
import PrivacyConsentBanner from "../components/landing/PrivacyConsentBanner";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="-mt-16">
        <Hero />
        <Features />
        <Pricing />
        <Testimonial />
      </main>
      <Footer />
      <PrivacyConsentBanner />
    </div>
  );
}
