import { motion } from "motion/react";

const lines = [
  "Nós acreditamos que estilo não se compra.",
  "Ele se constrói.",
  "Cada detalhe comunica quem você é.",
  "A GEA nasceu para quem valoriza",
  "o tempo, a presença e a evolução.",
];

export function Manifesto() {
  return (
    <section className="relative bg-gea-black py-40 md:py-56">
      <div className="mx-auto max-w-4xl px-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1 }}
          className="mb-16 block text-center text-[0.65rem] uppercase tracking-[0.5em] text-gea-sunset/70"
        >
          Manifesto
        </motion.span>

        <div className="space-y-6 md:space-y-8 text-center">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(1.5rem,3.6vw,2.6rem)] leading-[1.35] text-gea-cream/90 font-display italic"
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
