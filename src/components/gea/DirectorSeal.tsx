import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function DirectorSeal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <footer className="relative z-10 flex justify-center px-6 pb-10 pt-16 bg-gea-black">
        <motion.button
          type="button"
          onClick={() => setOpen(true)}
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          whileHover={{ y: -2 }}
          className="group relative overflow-hidden rounded-[2px] border border-white/10 bg-[#0a0a0a] px-5 py-3 text-left transition-all duration-500 hover:border-[#c9c9c9]/40 hover:shadow-[0_10px_40px_-20px_rgba(201,201,201,0.35)]"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #0a0a0a 0%, #101010 50%, #070707 100%)",
          }}
          aria-label="Sobre o diretor criativo"
        >
          {/* Silver sweep on hover */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-[1400ms] ease-out group-hover:translate-x-full"
          />

          <span className="relative flex items-center gap-4">
            {/* Signature mark icon */}
            <span
              aria-hidden
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[#c9c9c9]/25 bg-black/60"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-[#d9d9d9]"
              >
                <path d="M3 18c3-6 6-10 9-10s2 6 5 6 4-4 4-4" />
                <path d="M4 21h16" opacity="0.5" />
              </svg>
            </span>

            <span className="flex flex-col leading-tight">
              <span
                className="text-[0.55rem] uppercase tracking-[0.42em] text-[#8a8a8a] transition-colors duration-500 group-hover:text-[#c9c9c9]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Creative Director
              </span>
              <span
                className="mt-1 text-[0.95rem] font-light tracking-[0.02em] text-[#e8e8e8]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Breno Elias
              </span>
              <span
                className="mt-0.5 text-[0.55rem] uppercase tracking-[0.28em] text-[#5c5c5c]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Creator of the GEA Experience
              </span>
            </span>
          </span>
        </motion.button>
      </footer>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="director-seal-title"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-[3px] border border-[#c9c9c9]/20 p-10 text-center shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
              style={{
                backgroundImage:
                  "linear-gradient(155deg, #0d0d0d 0%, #141414 45%, #080808 100%)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="absolute right-4 top-4 text-[#7a7a7a] transition-colors hover:text-[#e8e8e8]"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                  <path d="M6 6l12 12M18 6l-12 12" />
                </svg>
              </button>

              <div className="mx-auto mb-6 h-px w-12 bg-gradient-to-r from-transparent via-[#c9c9c9]/60 to-transparent" />

              <p
                id="director-seal-title"
                className="text-[0.55rem] uppercase tracking-[0.5em] text-[#8a8a8a]"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Creative Direction
              </p>
              <h2
                className="mt-3 text-3xl font-light tracking-[0.02em] text-[#efefef]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                Breno Elias
              </h2>

              <div className="mx-auto mt-6 h-px w-16 bg-[#c9c9c9]/20" />

              <p
                className="mt-6 text-[0.9rem] leading-relaxed text-[#c4c4c4]"
                style={{ fontFamily: "'Instrument Serif', serif" }}
              >
                A GEA foi idealizada e dirigida por Breno Elias.
                <br />
                Cada detalhe desta experiência foi pensado para transmitir
                presença, elegância e exclusividade.
                <br />
                <span className="text-[#8a8a8a]">
                  Obrigado por fazer parte do início desta história.
                </span>
              </p>

              {/* Digital signature */}
              <div className="mt-10 flex flex-col items-center gap-2">
                <svg
                  width="180"
                  height="52"
                  viewBox="0 0 180 52"
                  fill="none"
                  className="text-[#d9d9d9]"
                  aria-hidden
                >
                  <motion.path
                    d="M6 34 C 18 12, 28 44, 38 28 S 54 8, 66 30 C 74 44, 84 18, 96 26 C 108 34, 118 14, 130 28 C 140 40, 152 22, 168 24"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    fill="none"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 2.2, ease: "easeInOut", delay: 0.2 }}
                  />
                  <motion.path
                    d="M40 42 L 158 42"
                    stroke="currentColor"
                    strokeWidth="0.6"
                    strokeOpacity="0.35"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, delay: 1.4 }}
                  />
                </svg>
                <span
                  className="text-[0.5rem] uppercase tracking-[0.5em] text-[#6a6a6a]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Breno Elias · MMXXVI
                </span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
