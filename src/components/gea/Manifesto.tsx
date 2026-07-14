import { motion } from "motion/react";

const lines = [
  "Nós acreditamos que estilo não se compra.",
  "Ele se constrói.",
  "Cada detalhe comunica quem você é.",
  "A GEA nasceu para quem valoriza",
  "o tempo, a presença e a evolução.",
];

const about = [
  "A GEA é para quem entende que estilo é presença.",
  "Cada peça foi pensada para marcar o pulso de quem se move com propósito — no volante, na rua, na foto que fica.",
  "Um relógio GEA não completa um look. Ele confirma uma identidade.",
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

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2 }}
          className="mx-auto mt-32 h-px w-16 bg-gea-sunset/40 md:mt-40"
        />

        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.2 }}
          className="mt-16 block text-center text-[0.65rem] uppercase tracking-[0.5em] text-gea-sunset/70"
        >
          Sobre a GEA
        </motion.span>

        <div className="mt-10 space-y-5 text-center md:space-y-6">
          {about.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.7] text-gea-cream/70"
            >
              {line}
            </motion.p>
          ))}
        </div>
      </div>
    </section>
  );
}
