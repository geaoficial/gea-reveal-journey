import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";

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
      <footer className="relative z-10 flex flex-col items-center gap-6 px-6 pb-6 pt-14 bg-gea-black">
        <LegalLinks />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Sobre o diretor criativo"
          className="group inline-flex items-center gap-[6px] text-[9px] tracking-[0.28em] text-[#3a3a3a] transition-colors duration-300 hover:text-[#7a7a7a] focus:outline-none focus-visible:text-[#8a8a8a]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span aria-hidden className="h-px w-3 bg-current opacity-60" />
          <span className="uppercase">Direção</span>
          <span
            className="normal-case tracking-[0.05em]"
            style={{ fontFamily: "'Instrument Serif', serif", fontSize: "10px" }}
          >
            Breno Elias
          </span>
        </button>
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
                backgroundImage: "linear-gradient(155deg, #0d0d0d 0%, #141414 45%, #080808 100%)",
              }}
            >
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Fechar"
                className="absolute right-4 top-4 text-[#7a7a7a] transition-colors hover:text-[#e8e8e8]"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                >
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
                Cada detalhe desta experiência foi pensado para transmitir presença, elegância e
                exclusividade.
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

function LegalLinks() {
  const openPrefs = () => window.dispatchEvent(new CustomEvent("gea:open-consent"));
  const linkClass = "text-[#7a7a7a] transition-colors hover:text-[#e8e8e8]";
  return (
    <nav
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.55rem] uppercase tracking-[0.36em]"
      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
    >
      <Link to="/privacidade" className={linkClass}>
        Privacidade
      </Link>
      <span aria-hidden className="text-[#3a3a3a]">
        ·
      </span>
      <Link to="/cookies" className={linkClass}>
        Cookies
      </Link>
      <span aria-hidden className="text-[#3a3a3a]">
        ·
      </span>
      <Link to="/termos" className={linkClass}>
        Termos
      </Link>
      <span aria-hidden className="text-[#3a3a3a]">
        ·
      </span>
      <button type="button" onClick={openPrefs} className={linkClass}>
        Preferências
      </button>
    </nav>
  );
}
