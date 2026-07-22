import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "motion/react";
import { useVip } from "@/lib/vip";


const IG_URL = "https://instagram.com/geastoree";

// Data-alvo do próximo drop. Ajuste para a data real do lançamento.
// Usa UTC para evitar surpresas com fuso horário no SSR/CDN.
const LAUNCH_ISO = "2026-08-15T21:00:00-03:00";
// Janela de antecipação em que o progresso vai de 0 → 100 (padrão 45 dias).
const ANTICIPATION_WINDOW_MS = 45 * 24 * 60 * 60 * 1000;

function useCountdown(targetISO: string) {
  const target = useMemo(() => new Date(targetISO).getTime(), [targetISO]);
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) {
    return { ready: false, days: 0, hours: 0, minutes: 0, seconds: 0, progress: 0, launched: false } as const;
  }

  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const elapsed = ANTICIPATION_WINDOW_MS - diff;
  const progress = Math.max(0, Math.min(1, elapsed / ANTICIPATION_WINDOW_MS));

  return {
    ready: true,
    days,
    hours,
    minutes,
    seconds,
    progress,
    launched: diff === 0,
  } as const;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

/**
 * Cena final oculta — surge após 1.8s de permanência real na seção.
 * Recompensa o scroll com contagem regressiva do próximo drop e um
 * badge dinâmico "Insider Nº X · Progresso Y%" que evolui junto com
 * a antecipação global. Cria pertencimento, mistério e urgência.
 */
export function HiddenChapter() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30%" });
  const [revealed, setRevealed] = useState(false);
  const { ready, days, hours, minutes, seconds, progress, launched } = useCountdown(LAUNCH_ISO);
  const [founderNumber, setFounderNumber] = useState<string | null>(null);

  useEffect(() => {
    if (!inView) return;
    const t = setTimeout(() => setRevealed(true), 1800);
    return () => clearTimeout(t);
  }, [inView]);

  useEffect(() => {
    try {
      const n = window.localStorage.getItem("gea.founder.number");
      if (n) setFounderNumber(String(n).padStart(4, "0"));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!revealed || typeof window === "undefined") return;
    const p = (window as unknown as { plausible?: (event: string, opts?: { props?: Record<string, string> }) => void }).plausible;
    p?.("Hidden Chapter Reached", {
      props: { progress: `${Math.round(progress * 100)}%` },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  const vip = useVip();
  const handleReturn = () => {
    if (typeof window === "undefined") return;
    vip.markPending();
    const p = (window as unknown as { plausible?: (event: string, opts?: { props?: Record<string, string> }) => void }).plausible;
    p?.("Follow Instagram", { props: { location: "hidden-chapter" } });
  };


  const percent = Math.round(progress * 100);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center justify-center bg-gea-black px-6 py-40">
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

        {/* Contagem regressiva */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 1.4, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mt-14 flex flex-col items-center gap-4"
        >
          <span className="text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/45">
            {launched ? "O drop está no ar" : "Próximo drop em"}
          </span>

          <div className="flex w-full max-w-md items-center justify-center" aria-live="polite">
            <span className="text-[0.7rem] uppercase tracking-[0.4em] text-gea-sunset tabular-nums">
              {ready ? `${percent}%` : "--%"}
            </span>
          </div>


        </motion.div>

        {/* Badge dinâmico de progresso */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 1.4, delay: 0.9 }}
          className="mt-10 flex w-full max-w-sm flex-col items-center gap-4 border-y border-gea-cream/10 py-6"
        >
          <div className="flex w-full items-center justify-between text-[0.55rem] uppercase tracking-[0.4em] text-gea-cream/55">
            <span className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gea-sunset/60" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gea-sunset" />
              </span>
              Insider {founderNumber ? `Nº ${founderNumber}` : "GEA"}
            </span>
            <span className="tabular-nums text-gea-sunset">{ready ? `${percent}%` : "--%"}</span>
          </div>


          <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gea-cream/35">
            Antecipação global
          </span>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 1.2 }}
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
          transition={{ duration: 1, delay: 1.4 }}
          className="group mt-10 inline-flex items-center gap-3 border border-gea-cream/30 px-8 py-4 text-[0.68rem] uppercase tracking-[0.36em] text-gea-cream transition-all duration-500 hover:border-gea-sunset hover:bg-gea-sunset hover:text-gea-black"
        >
          Entrar no círculo
          <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
        </motion.a>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 1.4, delay: 1.6 }}
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
