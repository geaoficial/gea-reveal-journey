import { motion } from "motion/react";

const lines = [
  "Estilo não se compra.",
  "Se constrói.",
  "Cada detalhe revela quem você é.",
];

const closing = "Bem-vindo ao início da história.";

export function Manifesto() {
  return (
    <section className="relative bg-gea-black py-32 md:py-44">
      <div className="mx-auto max-w-3xl px-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1 }}
          className="mb-12 block text-center text-[0.62rem] uppercase tracking-[0.5em] text-gea-sunset/70"
        >
          Manifesto
        </motion.span>

        <div className="space-y-5 md:space-y-6 text-center">
          {lines.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(1.6rem,4vw,2.8rem)] font-light leading-[1.25] tracking-tight text-gea-cream font-display"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 h-px w-14 origin-center bg-gea-sunset/60 md:mt-20"
        />

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.5 }}
          className="mx-auto mt-10 max-w-md text-center text-[clamp(0.95rem,1.6vw,1.15rem)] font-light leading-[1.6] text-gea-cream/75"
        >
          Presença vale mais do que aparência.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.7 }}
          className="mt-12 text-center text-[clamp(1rem,1.8vw,1.25rem)] font-light text-gea-cream/85 font-display md:mt-16"
        >
          {closing}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.42em" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.6, delay: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 text-center text-[0.68rem] uppercase text-gea-sunset/70"
        >
          GEA — O tempo revela.
        </motion.p>
      </div>
    </section>
  );
}
