import { motion } from "motion/react";

const IG_URL = "https://instagram.com/geastoree";

export function InstagramSection() {
  return (
    <section id="instagram" className="relative bg-gea-black py-40 md:py-56">
      <div className="mx-auto max-w-4xl px-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-10 block text-center text-[0.65rem] uppercase tracking-[0.5em] text-gea-sunset/70"
        >
          @geastoree
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center text-[clamp(2rem,5vw,3.6rem)] leading-[1.1] text-gea-cream font-display italic"
        >
          A história da GEA está apenas começando.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mx-auto mt-8 max-w-xl text-center text-sm text-gea-cream/60"
        >
          Os bastidores, lançamentos e novidades aparecem primeiro no Instagram.
        </motion.p>

        <div className="mt-16 flex flex-col items-center">
          <motion.a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative inline-flex items-center gap-4 bg-gea-cream px-10 py-5 text-[0.72rem] uppercase tracking-[0.36em] text-gea-black transition-colors duration-500 hover:bg-gea-sunset"
          >
            Seguir @geastoree
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-8 max-w-md text-center text-xs italic text-gea-cream/45 font-display"
          >
            Junte-se aos primeiros que estão acompanhando essa jornada.
          </motion.p>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, delay: 0.2 }}
          className="mt-32 text-center text-[clamp(1.1rem,2vw,1.6rem)] italic text-gea-cream/60 font-display md:mt-40"
        >
          O próximo capítulo começa agora.
        </motion.p>
      </div>
    </section>
  );
}
