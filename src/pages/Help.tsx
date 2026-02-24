import { useState } from "react";
import { Link } from "react-router-dom";
import { Shield, Search, Mail, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { motion } from "framer-motion";

const faqSections = [
  {
    title: "For Clients",
    items: [
      { q: "How do I hire a freelancer?", a: "Browse our Discover page to find vetted freelancers by category. Visit their profile to review their portfolio and ratings, then submit a project brief with your requirements, budget, and timeline." },
      { q: "What is escrow and how does it protect me?", a: "Escrow holds your payment securely until you approve the freelancer's delivery. This ensures you only pay for work that meets your expectations. If there's a dispute, our team mediates." },
      { q: "How do I dispute a delivery?", a: "If you're unsatisfied with a delivery, you can raise a dispute from the order detail page. Our admin team will review the case, communicate with both parties, and reach a fair resolution." },
      { q: "Can I see a freelancer's past work?", a: "Yes. Every freelancer profile includes a portfolio section with project samples, descriptions, and the skills used. You can also see their average rating from previous clients." },
    ],
  },
  {
    title: "For Freelancers",
    items: [
      { q: "How do I apply to join DigiReps?", a: "Sign up and select the Freelancer role. Complete your profile with skills, experience, portfolio items, and hourly rate. Submit your application and our team will review it within 24–72 hours." },
      { q: "How long does the review process take?", a: "Most applications are reviewed within 24–72 hours. You'll receive a notification when your profile is approved, or if any revisions are needed." },
      { q: "How do I get paid?", a: "When a client approves your delivery, the escrowed payment is released. You can track all your earnings from the Earnings page in your dashboard." },
      { q: "What happens if my application is rejected?", a: "You'll receive feedback explaining why. In many cases, you can update your profile and reapply. Focus on completing your portfolio and adding detailed experience." },
    ],
  },
  {
    title: "General",
    items: [
      { q: "Is my data secure on DigiReps?", a: "Yes. All communication happens on-platform, and we enforce strict policies against sharing personal contact information. Your data is encrypted and stored securely." },
      { q: "How do I contact support?", a: "You can reach our support team at support@digireps.com. We typically respond within 24 hours on business days." },
      { q: "What are DigiReps' fees?", a: "DigiReps charges a commission on completed projects. The exact rate is shown transparently on each order. There are no hidden fees or upfront charges for either party." },
      { q: "Can I use DigiReps on mobile?", a: "Yes. DigiReps is fully responsive and works on all modern browsers, including mobile devices and tablets." },
    ],
  },
];

const Help = () => {
  const [search, setSearch] = useState("");
  const lowerSearch = search.toLowerCase();

  const filteredSections = faqSections.map((section) => ({
    ...section,
    items: section.items.filter(
      (item) =>
        item.q.toLowerCase().includes(lowerSearch) ||
        item.a.toLowerCase().includes(lowerSearch)
    ),
  })).filter((section) => section.items.length > 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-[100] bg-background/60 backdrop-blur-xl border-b border-border/40">
        <div className="container flex h-20 items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 shadow-lg group-hover:scale-105 transition-all duration-500">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-2xl font-bold tracking-tight text-foreground">
              Digi<span className="text-primary">Reps</span>
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/how-it-works">
              <Button variant="ghost" className="font-display font-bold text-xs uppercase tracking-widest hover:bg-primary/5 hover:text-primary h-11 px-6 rounded-xl">How It Works</Button>
            </Link>
            <Link to="/auth">
              <Button className="h-11 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-8 shadow-lg shadow-primary/20 font-display font-bold text-xs uppercase tracking-widest border-0">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-40 pb-16">
        <div className="container max-w-3xl mx-auto text-center space-y-8">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="font-display text-5xl sm:text-6xl font-bold tracking-tighter text-foreground">
              Help Center
            </h1>
            <p className="text-lg text-muted-foreground mt-4 font-medium">
              Find answers to common questions about using DigiReps.
            </p>
            <div className="relative mt-10 max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground/40" />
              <Input
                placeholder="Search for answers..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-14 pl-12 pr-6 rounded-2xl border-border/60 bg-card text-base font-medium focus-visible:ring-primary/30"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Sections */}
      <section className="container max-w-3xl mx-auto pb-24 space-y-16">
        {filteredSections.map((section, si) => (
          <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: si * 0.1 }}>
            <h2 className="font-display text-2xl font-bold tracking-tight mb-6">{section.title}</h2>
            <Accordion type="single" collapsible className="space-y-3">
              {section.items.map((item, i) => (
                <AccordionItem key={i} value={`${si}-${i}`} className="border border-border/60 rounded-2xl px-6 bg-card data-[state=open]:border-primary/30 transition-colors">
                  <AccordionTrigger className="text-left font-display font-bold text-base tracking-tight hover:no-underline py-5">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed pb-5">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        ))}

        {filteredSections.length === 0 && (
          <div className="text-center py-16 space-y-4">
            <p className="text-muted-foreground text-lg font-medium">No results found for "{search}"</p>
            <Button variant="ghost" onClick={() => setSearch("")} className="font-bold text-xs uppercase tracking-widest">Clear Search</Button>
          </div>
        )}
      </section>

      {/* Contact Support */}
      <section className="container max-w-3xl mx-auto pb-24">
        <div className="bg-card border border-border/60 rounded-3xl p-10 text-center space-y-6">
          <div className="h-16 w-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary mx-auto">
            <Mail className="h-8 w-8" />
          </div>
          <h3 className="font-display text-2xl font-bold tracking-tight">Still need help?</h3>
          <p className="text-muted-foreground font-medium max-w-md mx-auto">Our support team is here to assist you. We typically respond within 24 hours.</p>
          <a href="mailto:support@digireps.com">
            <Button className="h-12 px-8 rounded-xl bg-primary text-primary-foreground font-display font-bold text-xs uppercase tracking-widest border-0 gap-2">
              <Mail className="h-4 w-4" /> Contact Support
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border/40">
        <div className="container py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground font-medium text-xs uppercase tracking-[0.2em]">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary/40" />
              <span>© 2026 DigiReps. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link>
              <Link to="/" className="hover:text-primary transition-colors">Home</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Help;
