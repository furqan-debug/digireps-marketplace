import { Code, Palette, Video, PenTool, Smartphone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { name: "Web Development", desc: "Full-stack scalable solutions", icon: Code, color: "from-blue-600/20 to-blue-600/5", ring: "group-hover:ring-blue-500/30" },
  { name: "UI/UX Design", desc: "Intuitive premium interfaces", icon: Palette, color: "from-purple-600/20 to-purple-600/5", ring: "group-hover:ring-purple-500/30" },
  { name: "Video Editing", desc: "High-retention social content", icon: Video, color: "from-pink-600/20 to-pink-600/5", ring: "group-hover:ring-pink-500/30" },
  { name: "Copywriting", desc: "Conversion-optimized texts", icon: PenTool, color: "from-amber-600/20 to-amber-600/5", ring: "group-hover:ring-amber-500/30" },
  { name: "Mobile App Dev", desc: "Native iOS & Android apps", icon: Smartphone, color: "from-green-600/20 to-green-600/5", ring: "group-hover:ring-green-500/30" },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

export const ServiceCategories = () => (
  <section className="container py-24 my-16">
    <div className="bg-secondary/20 rounded-[3rem] border border-border/40 p-10 sm:p-14 lg:p-20 relative overflow-hidden shadow-sm">
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="text-center mb-16 space-y-4 relative z-10">
        <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Specialized Expertise</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Curated talent across high-impact digital sectors, ready to deliver.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 relative z-10 w-full">
        {services.map(({ name, desc, icon: Icon, color, ring }) => (
          <motion.div
            key={name}
            variants={itemVariants}
            className={`group flex flex-col items-start gap-4 rounded-3xl surface border border-border/80 p-6 transition-all duration-500 hover:shadow-lg hover:-translate-y-2 cursor-pointer relative overflow-hidden bg-card/60 backdrop-blur-sm ${ring} ring-0 hover:ring-2`}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${color} transition-all duration-500 group-hover:scale-110 shadow-sm border border-black/5 dark:border-white/5`}>
              <Icon className="h-6 w-6 text-foreground/80 group-hover:text-primary transition-colors" />
            </div>

            <div className="space-y-1 relative z-10">
              <span className="block font-display text-[15px] font-bold tracking-tight text-foreground transition-colors">{name}</span>
              <span className="block font-sans text-xs font-medium text-muted-foreground leading-snug">{desc}</span>
            </div>

            <div className="mt-auto pt-2 w-full flex justify-end opacity-0 group-hover:opacity-100 transition-opacity delay-100">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  </section>
);
