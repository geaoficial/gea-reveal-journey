import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function LegalShell({
  eyebrow,
  title,
  updated,
  children,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="min-h-screen bg-gea-black text-gea-cream">
      <div className="mx-auto max-w-3xl px-6 pb-24 pt-20 sm:pt-28">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.42em] text-[#8a8a8a] transition-colors hover:text-[#e8e8e8]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          <span aria-hidden>←</span> Voltar
        </Link>

        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#c9c9c9]/50" />
            <p
              className="text-[0.55rem] uppercase tracking-[0.42em] text-[#8a8a8a]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {eyebrow}
            </p>
          </div>
          <h1
            className="mt-5 text-4xl font-light tracking-tight text-[#efefef] sm:text-5xl"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            {title}
          </h1>
          <p
            className="mt-3 text-[0.7rem] uppercase tracking-[0.32em] text-[#6a6a6a]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            Atualizado em {updated}
          </p>
        </motion.header>

        <div className="legal-prose mt-12 space-y-6 text-[0.95rem] leading-relaxed text-[#c4c4c4]">
          {children}
        </div>

        <footer className="mt-20 border-t border-white/5 pt-8 text-center">
          <p
            className="text-[0.55rem] uppercase tracking-[0.5em] text-[#5c5c5c]"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            GEA · O tempo revela
          </p>
        </footer>
      </div>
    </main>
  );
}
