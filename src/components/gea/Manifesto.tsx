import { motion } from "motion/react";

const lines = [
  "Nós acreditamos que estilo não se compra.",
  "Ele se constrói.",
  "Cada detalhe comunica quem você é.",
  "A GEA nasceu para quem valoriza",
  "o tempo, a presença e a evolução.",
];

const essenceIntro =
  "Uma marca para quem acredita que presença vale mais do que aparência.";

const essenceParagraphs = [
  "Elegância, atitude e autenticidade em cada detalhe.",
  "Inspirada na arquitetura, no cinema e no design minimalista.",
];

const essenceClosing = [
  "Você não chegou até aqui por acaso.",
  "Bem-vindo ao início da história.",
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

        <motion.h3
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mt-6 text-center text-[clamp(1.6rem,3.2vw,2.4rem)] leading-[1.25] text-gea-cream font-display italic"
        >
          A Essência da GEA
        </motion.h3>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-12 max-w-2xl text-center text-[clamp(1.1rem,1.9vw,1.35rem)] leading-[1.55] text-gea-cream/90"
        >
          {essenceIntro}
        </motion.p>

        <div className="mt-12 space-y-8 md:mt-16 md:space-y-10">
          {essenceParagraphs.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="mx-auto max-w-2xl text-[clamp(0.95rem,1.5vw,1.05rem)] leading-[1.8] text-gea-cream/65"
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
          className="mx-auto mt-24 h-px w-10 bg-gea-sunset/40 md:mt-32"
        />

        <div className="mt-16 space-y-4 text-center md:space-y-5">
          {essenceClosing.map((line, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 1.2, delay: i * 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(1.2rem,2.4vw,1.8rem)] leading-[1.35] text-gea-cream/85 font-display italic"
            >
              {line}
            </motion.p>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          whileInView={{ opacity: 1, letterSpacing: "0.42em" }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.6, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center text-[0.72rem] uppercase text-gea-sunset/70"
        >
          GEA — O tempo revela.
        </motion.p>
      </div>
    </section>
  );
}
