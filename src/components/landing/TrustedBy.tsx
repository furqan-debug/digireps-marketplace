const trustedBy = ["TechCorp", "DesignLab", "StartupXYZ", "MediaPro", "CloudBase", "InnoVate"];

export const TrustedBy = () => (
  <section className="container py-12 relative overflow-hidden">
    <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
    <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    <div className="text-center mb-8 relative z-20">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/60">Trusted by modern teams at</p>
    </div>
    <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 hover:opacity-100 transition-opacity duration-700 relative z-20">
      {trustedBy.map((name) => (
        <span key={name} className="font-display text-lg sm:text-xl font-bold text-muted-foreground/40 hover:text-foreground transition-all duration-300 cursor-default tracking-tight hover:scale-105">
          {name}
        </span>
      ))}
    </div>
  </section>
);
