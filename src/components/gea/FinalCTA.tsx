import { motion } from "motion/react";

const IG_URL = "https://instagram.com/geastoree";

export function FinalCTA() {
  return (
    <section className="relative flex min-h-[100dvh] flex-col items-center justify-center bg-black px-6 py-24 text-center">
      <motion.div
        initial={{ opacity: 0, letterSpacing: "0.5em" }}
        whileInView={{ opacity: 1, letterSpacing: "0.08em" }}
        viewport={{ once: true }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        className="text-[clamp(5rem,16vw,11rem)] leading-none text-gea-cream font-display"
      >
        GEA
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="mt-8 max-w-xl text-[clamp(1.1rem,2.4vw,1.8rem)] italic text-gea-cream/80 font-display"
      >
        O próximo capítulo começa agora.
      </motion.p>

      <motion.a
        href={IG_URL}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1 }}
        whileHover={{ scale: 1.02 }}
        className="group mt-16 inline-flex items-center gap-4 border border-gea-cream/50 px-10 py-5 text-[0.72rem] uppercase tracking-[0.36em] text-gea-cream transition-colors duration-500 hover:border-gea-sunset hover:bg-gea-sunset hover:text-gea-black"
      >
        Entrar no Instagram
        <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
      </motion.a>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 1.5 }}
        className="mt-16 text-[10px] uppercase tracking-[0.4em] text-gea-cream/30"
      >
        @geastoree
      </motion.p>
    </section>
  );
}
