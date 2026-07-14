import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "motion/react";

const IG_URL = "https://instagram.com/geastoree";

/**
 * Cena final oculta — surge apenas após 1.8s de permanência real na
 * seção. Cria sensação de descoberta e recompensa o scroll completo.
 * O texto é reforço final, minimal, com um único CTA de retorno.
 */
export function HiddenChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setRevealed(true), 1800);
    return () => clearTimeout(t);
  }, [inView]);

  const handleReturn = () => {
    if (typeof window === "undefined") return;
    const p = (window as unknown as { plausible?: (event: string, opts?: { props?: Record<string, string> }) => void }).plausible;
    p?.("Follow Instagram", { props: { location: "hidden-chapter" } });
  };

  return (
    <section ref={ref} className="relative flex min-h-[100dvh] items-center justify-center bg-gea-black px-6 py-40">
      <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 1.4 }}
          className="text-[0.55rem] uppercase tracking-[0.6em] text-gea-sunset/70"
        >
          Capítulo 00
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30, filter: "blur(12px)" }}
          animate={
            revealed
              ? { opacity: 1, y: 0, filter: "blur(0px)" }
              : { opacity: 0, y: 30, filter: "blur(12px)" }
          }
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 max-w-xl text-[clamp(1.8rem,4.2vw,3.2rem)] leading-[1.15] text-gea-cream font-display italic"
        >
          Poucos chegam até aqui.
          <br />
          Você é um deles.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 0.4 }}
          className="mt-10 max-w-md text-[0.7rem] uppercase tracking-[0.36em] text-gea-cream/50"
        >
          O restante da história acontece no Instagram.
        </motion.p>

        <motion.a
          href={IG_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleReturn}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: revealed ? 1 : 0, y: revealed ? 0 : 20 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="group mt-12 inline-flex items-center gap-3 border border-gea-cream/30 px-8 py-4 text-[0.68rem] uppercase tracking-[0.36em] text-gea-cream transition-all duration-500 hover:border-gea-sunset hover:bg-gea-sunset hover:text-gea-black"
        >
          Entrar no círculo
          <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 1 }}
          className="mt-24 flex flex-col items-center gap-3"
        >
          <span className="h-px w-10 bg-gea-cream/20" />
          <span className="text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/35">
            GEA · O tempo revela
          </span>
        </motion.div>
      </div>
    </section>
  );
}
