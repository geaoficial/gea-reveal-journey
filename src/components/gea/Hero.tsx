import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import heroImage from "@/assets/gea-hero-sunset.jpeg.asset.json";

export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative h-[100dvh] w-full overflow-hidden bg-gea-black">
      <motion.div style={{ y }} className="absolute inset-0 scale-110">
        <img
          src={heroImage.url}
          alt="GEA — pôr do sol na estrada"
          className="h-full w-full object-cover object-center"
          loading="eager"
          fetchPriority="high"
        />
      </motion.div>


      {/* Cinematic overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/70 via-black/20 to-black/85" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.55)_100%)]" />

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.05em" }}
          transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-[clamp(4.5rem,18vw,12rem)] leading-none text-gea-cream font-display"
        >
          GEA
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          className="mt-3 text-[clamp(1.1rem,2.4vw,1.8rem)] italic text-gea-cream/85 font-display"
        >
          O tempo revela.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.4 }}
          className="mt-8 max-w-md text-[0.72rem] uppercase tracking-[0.42em] text-gea-cream/60"
        >
          Mais do que um relógio. Uma identidade.
        </motion.p>

        <motion.a
          href="#instagram"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 1.8 }}
          className="plausible-event-name=CTA+Click plausible-event-location=hero plausible-event-label=Entrar+para+a+GEA group mt-14 inline-flex items-center gap-3 border border-gea-cream/40 px-8 py-4 text-[0.7rem] uppercase tracking-[0.32em] text-gea-cream backdrop-blur-sm transition-all duration-500 hover:border-gea-cream hover:bg-gea-cream hover:text-gea-black"
        >
          Entrar para a GEA
          <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
        </motion.a>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.4, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2"
      >
        <div className="relative h-14 w-px overflow-hidden bg-gea-cream/20">
          <motion.div
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-x-0 top-0 h-1/2 bg-gea-cream"
          />
        </div>
      </motion.div>
    </section>
  );
}
