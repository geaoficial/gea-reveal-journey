import { motion } from "motion/react";
import lifestyle02 from "@/assets/gea-lifestyle-02.jpeg.asset.json";
import watchMystery from "@/assets/gea-watch-mystery.jpg.asset.json";

export function Lifestyle() {
  return (
    <section className="relative bg-gea-black">
      {/* Cena 1 — lifestyle sunset */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 1.4 }}
        className="relative h-[90dvh] w-full overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.15 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
          className="h-full w-full"
        >
          <img
            src={lifestyle02.url}
            alt="Silhueta ao pôr do sol — a espera antes do drop"
            loading="lazy"
            className="h-full w-full object-cover"
          />
        </motion.div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
      </motion.div>

      <div className="flex min-h-[60vh] items-center justify-center px-6 py-32">
        <motion.p
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-3xl text-center text-[clamp(2rem,5vw,4rem)] leading-[1.15] text-gea-cream font-display italic"
        >
          Algumas escolhas dizem tudo.
        </motion.p>
      </div>

      {/* Cena 2 — teaser misterioso do próximo drop */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.6 }}
          className="relative h-[100dvh] w-full overflow-hidden bg-black"
        >
          <motion.div
            initial={{ scale: 1.2, opacity: 0.6 }}
            whileInView={{ scale: 1.04, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
            className="h-full w-full"
          >
            <img
              src={watchMystery.url}
              alt="Próximo drop GEA — em breve"
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 45%" }}
            />
          </motion.div>

          {/* Brilho pulsante sobre o dial */}
          <motion.div
            aria-hidden
            animate={{ opacity: [0.15, 0.45, 0.15] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[38vmin] w-[38vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(232,138,58,0.35) 0%, transparent 65%)",
              filter: "blur(20px)",
            }}
          />

          {/* Vinheta acentuada só nessa cena */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.85) 100%)",
            }}
          />

          {/* Badge canto superior — Novo drop */}
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, delay: 0.6 }}
            className="absolute left-6 top-6 flex items-center gap-3 md:left-10 md:top-10"
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gea-sunset opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gea-sunset" />
            </span>
            <span className="text-[0.6rem] uppercase tracking-[0.5em] text-gea-cream/80">
              Próximo drop · Em breve
            </span>
          </motion.div>

          {/* Copy central misteriosa */}
          <div className="absolute inset-0 flex flex-col items-center justify-end px-6 pb-[14vh] text-center">
            <motion.span
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, delay: 0.9 }}
              className="text-[0.55rem] uppercase tracking-[0.6em] text-gea-sunset/80"
            >
              Capítulo 01 · Sem data
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1], delay: 1.1 }}
              className="mt-6 max-w-2xl text-[clamp(2rem,5.5vw,4.4rem)] leading-[1.05] text-gea-cream font-display"
            >
              Algo está prestes
              <br />
              <em className="italic text-gea-sunset/90">a revelar-se.</em>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.4, delay: 1.6 }}
              className="mt-6 max-w-md text-[0.72rem] uppercase tracking-[0.36em] text-gea-cream/55"
            >
              Um novo GEA nasce nas sombras.
              <br />
              Os primeiros verão primeiro.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
