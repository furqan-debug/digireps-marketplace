import { Code, Palette, Video, PenTool, Smartphone } from "lucide-react";
import { motion } from "framer-motion";

const services = [
  { name: "Web Development", icon: Code, color: "from-blue-500/20 to-blue-600/10" },
  { name: "UI/UX Design", icon: Palette, color: "from-purple-500/20 to-purple-600/10" },
  { name: "Video Editing", icon: Video, color: "from-pink-500/20 to-pink-600/10" },
  { name: "Copywriting", icon: PenTool, color: "from-amber-500/20 to-amber-600/10" },
  { name: "Mobile Development", icon: Smartphone, color: "from-green-500/20 to-green-600/10" },
];

const containerVariants = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

export const ServiceCategories = () => (
  <section className="container py-24 bg-secondary/20 rounded-3xl border border-border/40 my-16">
    <div className="text-center mb-16 space-y-4">
      <h2 className="font-display text-4xl sm:text-5xl font-bold text-foreground tracking-tight">Specialized Expertise</h2>
      <p className="text-muted-foreground text-lg max-w-xl mx-auto font-medium">Curated talent across high-impact digital sectors.</p>
    </div>
    <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-5 px-4">
      {services.map(({ name, icon: Icon, color }) => (
        <motion.div
          key={name}
          variants={itemVariants}
          className="group flex flex-col items-center gap-8 rounded-3xl border border-border/60 bg-background p-10 transition-all duration-500 hover:shadow-xl hover:border-primary/40 hover:-translate-y-2 cursor-pointer relative overflow-hidden text-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          <div className={`relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${color} transition-all duration-500 group-hover:scale-110 shadow-sm`}>
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <span className="relative font-display text-xs font-bold uppercase tracking-widest text-foreground group-hover:text-primary transition-colors">{name}</span>
        </motion.div>
      ))}
    </motion.div>
  </section>
);
