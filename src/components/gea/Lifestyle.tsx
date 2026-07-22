import { motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { lifestyleImage, mysteryImage } from "@/lib/responsive-image";
import { BlurImage } from "./BlurImage";
import { useDeviceCapability } from "@/lib/device-capability";
import { usePerfTier, blurFor } from "@/lib/perf-monitor";

/**
 * Reveal state:
 *  - x/y in %: last interaction position
 *  - strength: 0 (fully covered by fog) → 1 (fully revealed at spot)
 *
 * The fog is permanent. Interaction opens a soft spotlight that
 * regenerates (fades back to 0) after ~3.5s of inactivity, using
 * a single rAF loop — no per-frame React state, no touch blocking.
 */
export function Lifestyle() {
  const { allowHeavyFx, reducedMotion } = useDeviceCapability();
  const perfTier = usePerfTier();
  const lite = !allowHeavyFx || perfTier !== "cinema";
  const minimal = perfTier === "lite";

  const revealRef = useRef<HTMLDivElement>(null);
  const maskRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLSpanElement>(null);

  // Mutable interaction state kept out of React to avoid re-renders on move.
  const stateRef = useRef({
    x: 50,
    y: 55,
    strength: 0,
    lastInteract: 0,
    rafId: 0,
    running: false,
  });

  const HOLD_MS = 600; // full-strength hold after last move
  const FADE_MS = 2800; // gentle regeneration back to fog

  const applyDom = useCallback(() => {
    const s = stateRef.current;
    const mask = maskRef.current;
    if (mask) {
      // Spotlight radius grows with strength; fog color stays constant.
      const inner = 8 * s.strength;
      const mid = 10 + 12 * s.strength;
      mask.style.background = `radial-gradient(circle at ${s.x}% ${s.y}%, rgba(0,0,0,0) 0%, rgba(0,0,0,${0.15 * s.strength}) ${inner}%, rgba(0,0,0,${0.6 + 0.25 * (1 - s.strength)}) ${mid}%, rgba(0,0,0,0.98) 55%)`;
    }
    const ring = ringRef.current;
    if (ring) {
      ring.style.opacity = String(s.strength);
      ring.style.left = `${s.x}%`;
      ring.style.top = `${s.y}%`;
      ring.style.transform = `translate(-50%, -50%) scale(${0.85 + 0.15 * s.strength})`;
    }
    const hint = hintRef.current;
    if (hint) hint.style.opacity = String(0.6 * (1 - s.strength));
  }, []);

  const ensureLoop = useCallback(() => {
    const s = stateRef.current;
    if (s.running) return;
    s.running = true;
    const tick = () => {
      const st = stateRef.current;
      const now = performance.now();
      const elapsed = now - st.lastInteract;
      let target = 1;
      if (elapsed > HOLD_MS) {
        const t = Math.min(1, (elapsed - HOLD_MS) / FADE_MS);
        // easeOutCubic
        target = 1 - (1 - (1 - t) * (1 - t) * (1 - t));
      }
      // Smooth toward target.
      st.strength += (target - st.strength) * 0.15;
      applyDom();
      if (st.strength > 0.005 || target > 0.005) {
        st.rafId = requestAnimationFrame(tick);
      } else {
        st.strength = 0;
        applyDom();
        st.running = false;
      }
    };
    s.rafId = requestAnimationFrame(tick);
  }, [applyDom]);

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const el = revealRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const s = stateRef.current;
      s.x = ((e.clientX - rect.left) / rect.width) * 100;
      s.y = ((e.clientY - rect.top) / rect.height) * 100;
      s.lastInteract = performance.now();
      ensureLoop();
    },
    [ensureLoop],
  );

  // Cleanup rAF on unmount.
  useEffect(() => {
    return () => {
      const s = stateRef.current;
      if (s.rafId) cancelAnimationFrame(s.rafId);
      s.running = false;
    };
  }, []);

  // Initialize mask once (fully covered).
  useEffect(() => {
    applyDom();
  }, [applyDom]);

  // Static breathing opacity (no scroll-linked transforms → no jank).
  const [, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

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
        <div className="relative h-full w-full">
          <BlurImage
            src={lifestyleImage.fallback}
            srcSet={lifestyleImage.srcSet}
            webpSrcSet={lifestyleImage.webp}
            avifSrcSet={lifestyleImage.avif}
            sizes={lifestyleImage.sizes}
            fallbackSrc={lifestyleImage.fallback}
            telemetrySection="lifestyle-hero"
            alt="Silhueta ao pôr do sol — a espera antes do drop"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            draggable={false}
            className="h-full w-full object-cover"
            placeholder={lifestyleImage.placeholder}
          />
        </div>
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
        <div
          ref={revealRef}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerMove}
          className="relative h-[100dvh] w-full overflow-hidden bg-black"
          style={{ touchAction: "pan-y" }}
        >
          <div className="relative h-full w-full">
            <BlurImage
              src={mysteryImage.fallback}
              srcSet={mysteryImage.srcSet}
              webpSrcSet={mysteryImage.webp}
              avifSrcSet={mysteryImage.avif}
              sizes={mysteryImage.sizes}
              fallbackSrc={mysteryImage.fallback}
              telemetrySection="lifestyle-mystery"
              alt="Próximo drop GEA — em breve"
              loading="lazy"
              decoding="async"
              draggable={false}
              className="h-full w-full object-cover"
              style={{ objectPosition: "center 45%" }}
              placeholder={mysteryImage.placeholder}
            />
          </div>

          {/* Sombras permanentes — sem animação de scroll */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 28%, rgba(0,0,0,0.75) 78%, rgba(0,0,0,0.98) 100%)",
              opacity: 0.85,
            }}
          />

          {/* Névoa âmbar — presença constante */}
          <div
            aria-hidden
            style={{ opacity: 0.9 }}
            className="pointer-events-none absolute inset-0 mix-blend-screen"
          >
            <div
              className="absolute inset-x-[-10%] top-[10%] h-[80%]"
              style={{
                background:
                  "radial-gradient(ellipse 60% 40% at 30% 55%, rgba(232,138,58,0.32) 0%, rgba(232,138,58,0.12) 35%, transparent 70%), radial-gradient(ellipse 55% 45% at 75% 50%, rgba(255,168,90,0.22) 0%, transparent 65%), radial-gradient(ellipse 90% 35% at 50% 80%, rgba(120,60,20,0.35) 0%, transparent 70%)",
                filter: `blur(${blurFor(perfTier, lite ? 24 : 40)}px)`,
              }}
            />
          </div>

          {/* Cortina de fumaça — base densa e permanente */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] sm:h-[52%] md:h-[70%] mix-blend-screen"
            style={{
              background:
                "linear-gradient(to top, rgba(20,10,4,0.95) 0%, rgba(80,40,15,0.6) 25%, rgba(200,110,50,0.25) 55%, transparent 100%)",
              filter: "blur(20px)",
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] sm:h-[44%] md:h-[55%]"
            style={{
              background:
                "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 40%, transparent 100%)",
            }}
          />

          {/* Fumaça densa subindo — ancorada na base */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-0 right-0 bottom-0 h-[42%] sm:h-[56%] md:h-[70%] mix-blend-screen origin-bottom"
            style={{
              background:
                "radial-gradient(ellipse 45% 55% at 30% 100%, rgba(255,170,90,0.55) 0%, rgba(200,110,50,0.25) 35%, transparent 70%), radial-gradient(ellipse 40% 50% at 70% 100%, rgba(255,150,70,0.45) 0%, transparent 68%), radial-gradient(ellipse 60% 40% at 50% 100%, rgba(120,55,20,0.6) 0%, transparent 72%)",
              filter: `blur(${blurFor(perfTier, lite ? 28 : 50)}px)`,
              opacity: 0.9,
            }}
          />

          {/* Camada ambiente extra — desktop only */}
          {!lite && !reducedMotion && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-x-[-20%] bottom-[10%] h-[75%] mix-blend-screen opacity-75"
              animate={{ x: ["3%", "-5%", "3%"], y: ["6%", "-10%", "6%"] }}
              transition={{ duration: 26, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(ellipse 50% 45% at 45% 70%, rgba(255,180,100,0.4) 0%, transparent 72%), radial-gradient(ellipse 55% 40% at 20% 55%, rgba(180,90,40,0.32) 0%, transparent 74%)",
                filter: "blur(60px)",
                willChange: "transform",
              }}
            />
          )}

          {/* Pulso âmbar central */}
          {!minimal && !reducedMotion && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 mix-blend-overlay"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "radial-gradient(ellipse 60% 45% at 50% 60%, rgba(232,138,58,0.45) 0%, transparent 70%)",
                filter: `blur(${blurFor(perfTier, lite ? 32 : 55)}px)`,
              }}
            />
          )}

          {/* Máscara de revelação — controlada por rAF via ref, sem re-render */}
          <div
            ref={maskRef}
            aria-hidden
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 55%, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.98) 55%)",
            }}
          />

          {/* Anel de foco seguindo o cursor */}
          <div
            ref={ringRef}
            aria-hidden
            className="pointer-events-none absolute h-[26vmin] w-[26vmin] rounded-full"
            style={{
              left: "50%",
              top: "55%",
              opacity: 0,
              transform: "translate(-50%, -50%) scale(0.85)",
              border: "1px solid rgba(232,138,58,0.35)",
              boxShadow:
                "0 0 40px 4px rgba(232,138,58,0.15), inset 0 0 30px rgba(232,138,58,0.08)",
              transition: "opacity 300ms ease",
            }}
          />

          {/* Dica de interação */}
          <span
            ref={hintRef}
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-6 -translate-x-1/2 text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/60"
            style={{ opacity: 0.6, transition: "opacity 500ms ease" }}
          >
            Mova para revelar
          </span>

          {/* Badge canto superior */}
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

          {/* Copy central */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end px-6 pb-[14vh] text-center">
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
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
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
        </div>
      </div>
    </section>
  );
}
