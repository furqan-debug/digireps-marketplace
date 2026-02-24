const trustedBy = ["TechCorp", "DesignLab", "StartupXYZ", "MediaPro", "CloudBase", "InnoVate"];

export const TrustedBy = () => (
  <section className="container py-12">
    <div className="text-center mb-8">
      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-muted-foreground/50">Trusted by teams at</p>
    </div>
    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
      {trustedBy.map((name) => (
        <span key={name} className="font-display text-lg sm:text-xl font-bold text-muted-foreground/20 hover:text-muted-foreground/40 transition-colors cursor-default tracking-tight">
          {name}
        </span>
      ))}
    </div>
  </section>
);
