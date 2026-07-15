import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { heroImage } from "@/lib/responsive-image";
import { reportImageFailure } from "@/lib/image-telemetry";


export function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const barHeight = useTransform(scrollYProgress, [0, 1], ["8vh", "14vh"]);

  // Reveal quando a imagem estiver decodificada — cobre também o caso
  // em que a imagem já veio pronta do cache/SSR (onLoad não dispara).
  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    const reveal = () =>
      requestAnimationFrame(() => requestAnimationFrame(() => setLoaded(true)));
    if (img.complete && img.naturalWidth > 0) {
      (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(reveal);
      return;
    }
    // Rede de segurança: alguns browsers (Safari iOS) podem estagnar no decode
    // AVIF/WebP sem disparar load/error. Depois de 6s sem paint, força o
    // fallback JPEG via background-image para evitar ícone de imagem quebrada.
    const timeoutId = window.setTimeout(() => {
      if (!img.complete || img.naturalWidth === 0) {
        setFailed(true);
        reveal();
        reportImageFailure({
          asset: heroImage.fallback,
          reason: "timeout",
          section: "hero",
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
        });
      }
    }, 6000);
    const onLoad = () => {
      window.clearTimeout(timeoutId);
      reveal();
    };
    const onError = () => {
      window.clearTimeout(timeoutId);
      setFailed(true);
      reveal();
      reportImageFailure({
        asset: heroImage.fallback,
        reason: "error",
        section: "hero",
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
      });
    };
    img.addEventListener("load", onLoad, { once: true });
    img.addEventListener("error", onError, { once: true });
    return () => {
      window.clearTimeout(timeoutId);
      img.removeEventListener("load", onLoad);
      img.removeEventListener("error", onError);
    };
  }, []);


  return (
    <section ref={ref} className="relative h-[100dvh] w-full overflow-hidden bg-gea-black">
      <motion.div style={{ y }} className="absolute inset-x-0 top-[-10%] h-[120%]">
        <div
          aria-hidden
          className="absolute inset-0 z-0 transition-opacity duration-300"
          style={{
            opacity: loaded && !failed ? 0 : 1,
            background: heroImage.placeholder,
            filter: "blur(12px)",
            transform: "scale(1.05)",
          }}
        />
        {failed ? (
          <div
            role="img"
            aria-label="GEA — pôr do sol na estrada"
            className="relative z-[1] block h-full w-full bg-no-repeat bg-center bg-contain md:bg-cover md:bg-[62%_55%] lg:bg-center"
            style={{
              backgroundImage: `url("${heroImage.fallback}")`,
              backgroundColor: "#000",
            }}
          />
        ) : (

          <picture className="relative z-[1] block h-full w-full">
            <source type="image/avif" srcSet={heroImage.avif} sizes={heroImage.sizes} />
            <source type="image/webp" srcSet={heroImage.webp} sizes={heroImage.sizes} />
            <img
              ref={imgRef}
              src={heroImage.fallback}
              srcSet={heroImage.srcSet}
              sizes={heroImage.sizes}
              width={1920}
              height={1280}
              alt="GEA — pôr do sol na estrada"
              className="h-full w-full object-contain object-center md:object-cover md:object-[62%_55%] lg:object-center"
              style={{
                opacity: 1,
                imageRendering: "auto",
                backgroundColor: "#000",
              }}
              loading="eager"
              decoding="async"
              fetchPriority="high"
              draggable={false}
              onError={(e) => {
                setFailed(true);
                setLoaded(true);
                const el = e.currentTarget;
                reportImageFailure({
                  asset: heroImage.fallback,
                  reason: "error",
                  section: "hero",
                  naturalWidth: el?.naturalWidth,
                  naturalHeight: el?.naturalHeight,
                });
              }}
            />
          </picture>
        )}




      </motion.div>


      {/* Cinematic overlays */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/60 via-black/10 to-black/90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />

      {/* Cinema letterbox bars */}
      <motion.div
        initial={{ height: "50vh" }}
        animate={{ height: "8vh" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ height: barHeight }}
        className="pointer-events-none absolute inset-x-0 top-0 z-20 bg-gea-black"
      />
      <motion.div
        initial={{ height: "50vh" }}
        animate={{ height: "8vh" }}
        transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ height: barHeight }}
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gea-black"
      />

      {/* Top-left brand mark */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.6 }}
        className="absolute left-6 top-[calc(8vh+1.25rem)] z-30 text-[0.62rem] uppercase tracking-[0.5em] text-gea-cream/60 md:left-10"
      >
        GEA · Est.
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 1.6 }}
        className="absolute right-6 top-[calc(8vh+1.25rem)] z-30 text-[0.62rem] uppercase tracking-[0.5em] text-gea-cream/60 md:right-10"
      >
        Ato I
      </motion.div>

      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, letterSpacing: "0.6em", y: 10 }}
          animate={{ opacity: 1, letterSpacing: "0.02em", y: 0 }}
          transition={{ duration: 2, ease: [0.22, 1, 0.36, 1], delay: 0.6 }}
          className="text-[clamp(4rem,15vw,10rem)] font-light leading-none text-gea-cream font-display"
        >
          GEA
        </motion.div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 1.4, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="mt-8 h-px w-16 origin-center bg-gea-sunset/80"
        />

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 1.7 }}
          className="mt-8 text-[clamp(0.95rem,1.6vw,1.2rem)] font-light text-gea-cream/90 font-display"
        >
          O tempo revela.
        </motion.p>




        <motion.a
          href="#instagram"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 2.5 }}
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
        transition={{ delay: 2.8, duration: 1 }}
        className="absolute bottom-[calc(8vh+1.5rem)] left-1/2 z-30 -translate-x-1/2"
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
