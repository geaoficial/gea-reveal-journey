import { useEffect, useState } from "react";
import { motion } from "motion/react";

const STORAGE_KEY = "gea.founder.number";
// Seed inicial visível ao público — os primeiros que abrirem a página
// aterrissam entre este valor e valores crescentes conforme aparecem
// novos visitantes anônimos (persistido em localStorage).
const SEED = 137;

function readOrAssign(): number {
  if (typeof window === "undefined") return SEED;
  try {
    const existing = window.localStorage.getItem(STORAGE_KEY);
    if (existing) return Number.parseInt(existing, 10) || SEED;
    // Distribuição orgânica: valor aleatório dentro de uma janela para dar
    // sensação de "início" real sem parecer scriptado.
    const assigned = SEED + Math.floor(Math.random() * 96);
    window.localStorage.setItem(STORAGE_KEY, String(assigned));
    return assigned;
  } catch {
    return SEED;
  }
}

export function FounderBadge() {
  const [n, setN] = useState<number | null>(null);

  useEffect(() => {
    setN(readOrAssign());
  }, []);

  if (n === null) return null;

  const formatted = String(n).padStart(4, "0");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto mt-20 flex max-w-md flex-col items-center gap-4 border-y border-gea-cream/10 py-10"
    >
      <span className="text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/45">
        Círculo interno · Primeiros da GEA
      </span>
      <div className="flex items-baseline gap-2 font-display">
        <span className="text-[0.7rem] uppercase tracking-[0.4em] text-gea-sunset/80">Nº</span>
        <motion.span
          initial={{ letterSpacing: "0.3em", opacity: 0 }}
          animate={{ letterSpacing: "0.05em", opacity: 1 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="text-4xl font-light tabular-nums text-gea-cream"
        >
          {formatted}
        </motion.span>
      </div>
      <p className="max-w-xs text-center text-xs italic text-gea-cream/55 font-display">
        Você é um dos primeiros a entrar. Guarde esse número.
      </p>
    </motion.div>
  );
}
