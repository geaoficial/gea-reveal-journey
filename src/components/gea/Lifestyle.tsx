import { motion, useScroll, useTransform } from "motion/react";
import { useRef, useState } from "react";
import { lifestyleImage, mysteryImage } from "@/lib/responsive-image";
import { BlurImage } from "./BlurImage";

export function Lifestyle() {
  const revealRef = useRef<HTMLDivElement>(null);
  const [reveal, setReveal] = useState<{ x: number; y: number; active: boolean }>({
    x: 50,
    y: 55,
    active: false,
  });

  // Névoa âmbar dirigida por scroll — dissolve e reaparece conforme o teaser cruza a viewport
  const { scrollYProgress } = useScroll({
    target: revealRef,
    offset: ["start end", "end start"],
  });
  const fogOpacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.4, 0.6, 0.8, 1],
    [0, 0.85, 0.35, 0.9, 0.4, 0],
  );
  const fogY = useTransform(scrollYProgress, [0, 1], ["12%", "-14%"]);
  const fogScale = useTransform(scrollYProgress, [0, 0.5, 1], [1.1, 1.25, 1.05]);
  const shadowOpacity = useTransform(
    scrollYProgress,
    [0, 0.25, 0.5, 0.75, 1],
    [0.95, 0.55, 0.8, 0.5, 0.95],
  );

  const updateFromEvent = (clientX: number, clientY: number) => {
    const el = revealRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setReveal({ x, y, active: true });
  };


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
          className="relative h-full w-full"
        >
          <BlurImage
            src={lifestyleImage.fallback}
            srcSet={lifestyleImage.srcSet}
            webpSrcSet={lifestyleImage.webp}
            avifSrcSet={lifestyleImage.avif}
            sizes={lifestyleImage.sizes}
            alt="Silhueta ao pôr do sol — a espera antes do drop"
            loading="lazy"
            decoding="async"
            fetchPriority="low"
            draggable={false}
            className="h-full w-full object-cover"
            placeholder="radial-gradient(ellipse at 50% 65%, #d97a3c 0%, #7a2f1a 40%, #1a0e0a 80%, #000 100%)"
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
          ref={revealRef}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1.6 }}
          onMouseMove={(e) => updateFromEvent(e.clientX, e.clientY)}
          onMouseEnter={(e) => updateFromEvent(e.clientX, e.clientY)}
          onMouseLeave={() => setReveal((r) => ({ ...r, active: false }))}
          onTouchStart={(e) => {
            const t = e.touches[0];
            if (t) updateFromEvent(t.clientX, t.clientY);
          }}
          onTouchMove={(e) => {
            const t = e.touches[0];
            if (t) updateFromEvent(t.clientX, t.clientY);
          }}
          onTouchEnd={() => setReveal((r) => ({ ...r, active: false }))}
          className="relative h-[100dvh] w-full overflow-hidden bg-black cursor-none touch-none"
        >
          <motion.div
            initial={{ scale: 1.2, opacity: 0.6 }}
            whileInView={{ scale: 1.04, opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
            className="relative h-full w-full"
          >
            <BlurImage
              src={mysteryImage.fallback}
              srcSet={mysteryImage.srcSet}
              webpSrcSet={mysteryImage.webp}
              avifSrcSet={mysteryImage.avif}
              sizes={mysteryImage.sizes}
              alt="Próximo drop GEA — em breve"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              draggable={false}
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 45%" }}
              placeholder="radial-gradient(ellipse at 50% 50%, #4a2410 0%, #1a0d08 55%, #000 100%)"
            />
          </motion.div>

          {/* Sombras progressivas — respiram conforme o scroll */}
          <motion.div
            aria-hidden
            style={{ opacity: shadowOpacity }}
            className="pointer-events-none absolute inset-0"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.75) 78%, rgba(0,0,0,0.98) 100%)",
              }}
            />
          </motion.div>

          {/* Névoa âmbar — dissolve e reaparece com o scroll */}
          <motion.div
            aria-hidden
            style={{ opacity: fogOpacity, y: fogY, scale: fogScale }}
            className="pointer-events-none absolute inset-0 mix-blend-screen"
          >
            <div
              className="absolute inset-x-[-10%] top-[10%] h-[80%]"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 30% 55%, rgba(232,138,58,0.32) 0%, rgba(232,138,58,0.12) 35%, transparent 70%), radial-gradient(ellipse 55% 45% at 75% 50%, rgba(255,168,90,0.22) 0%, transparent 65%), radial-gradient(ellipse 90% 35% at 50% 80%, rgba(120,60,20,0.35) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
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

          {/* Máscara de revelação — só o spot em torno do cursor/toque mostra o mostrador */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 transition-[background,opacity] duration-500 ease-out"
            style={{
              background: `radial-gradient(circle at ${reveal.x}% ${reveal.y}%, transparent 0%, rgba(0,0,0,0.15) ${reveal.active ? "8%" : "0%"}, rgba(0,0,0,0.85) ${reveal.active ? "22%" : "12%"}, rgba(0,0,0,0.98) 55%)`,
            }}
          />

          {/* Anel de foco cinematográfico seguindo o cursor */}
          <motion.div
            aria-hidden
            animate={{
              opacity: reveal.active ? 1 : 0,
              scale: reveal.active ? 1 : 0.85,
            }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute h-[26vmin] w-[26vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: `${reveal.x}%`,
              top: `${reveal.y}%`,
              border: "1px solid rgba(232,138,58,0.35)",
              boxShadow:
                "0 0 40px 4px rgba(232,138,58,0.15), inset 0 0 30px rgba(232,138,58,0.08)",
            }}
          />

          {/* Dica de interação */}
          <motion.span
            aria-hidden
            animate={{ opacity: reveal.active ? 0 : 0.6 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/60"
          >
            Mova para revelar
          </motion.span>


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
