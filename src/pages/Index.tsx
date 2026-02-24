import { LandingNav } from "@/components/landing/LandingNav";
import { Hero } from "@/components/landing/Hero";
import { StatsRow } from "@/components/landing/StatsRow";
import { TrustedBy } from "@/components/landing/TrustedBy";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { Benefits } from "@/components/landing/Benefits";
import { ServiceCategories } from "@/components/landing/ServiceCategories";
import { Testimonials } from "@/components/landing/Testimonials";
import { DualAudience } from "@/components/landing/DualAudience";
import { CTABanner } from "@/components/landing/CTABanner";
import { LandingFooter } from "@/components/landing/LandingFooter";

const Index = () => (
  <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 selection:text-primary">
    <LandingNav />
    <Hero />
    <StatsRow />
    <TrustedBy />
    <HowItWorksSection />
    <Benefits />
    <ServiceCategories />
    <Testimonials />
    <DualAudience />
    <CTABanner />
    <LandingFooter />
  </div>
);

export default Index;
