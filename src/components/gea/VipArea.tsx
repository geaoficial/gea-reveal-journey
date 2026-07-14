import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useVip, formatUnlockDate } from "@/lib/vip";
import { VipCard } from "./VipCard";
import { shareVipImage } from "@/lib/vipShare";

const LAUNCH_ISO = "2026-08-15T21:00:00-03:00";
const IG_URL = "https://instagram.com/geastoree";

const BENEFITS = [
  { label: "Acesso antecipado às coleções", unlocked: true },
  { label: "Ofertas exclusivas VIP", unlocked: true },
  { label: "Cupons de inauguração", unlocked: true },
  { label: "Sorteios exclusivos", unlocked: false },
  { label: "Convites para campanhas", unlocked: false },
  { label: "Benefícios da comunidade GEA", unlocked: true },
];

function useCountdown(iso: string) {
  const target = useMemo(() => new Date(iso).getTime(), [iso]);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (now === null) return { d: 0, h: 0, m: 0, s: 0, ready: false };
  const diff = Math.max(0, target - now);
  const t = Math.floor(diff / 1000);
  return {
    ready: true,
    d: Math.floor(t / 86400),
    h: Math.floor((t % 86400) / 3600),
    m: Math.floor((t % 3600) / 60),
    s: t % 60,
  };
}

function pad(n: number) { return String(n).padStart(2, "0"); }

/**
 * Área VIP — "Meu Selo VIP".
 * Aparece automaticamente quando o visitante já desbloqueou o selo.
 */
export function VipArea() {
  const vip = useVip();
  const cd = useCountdown(LAUNCH_ISO);
  const [sharing, setSharing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!vip.hydrated || vip.status !== "unlocked") return null;

  const handleShare = async () => {
    setSharing(true);
    setFeedback(null);
    try {
      const result = await shareVipImage({ name: vip.name, memberId: vip.memberId });
      setFeedback(result === "shared" ? "Compartilhado" : "Imagem salva no seu dispositivo");
      try {
        const p = (window as unknown as { plausible?: (e: string, o?: { props?: Record<string,string> }) => void }).plausible;
        p?.("VIP Share", { props: { result } });
      } catch { /* ignore */ }
    } catch {
      setFeedback("Não foi possível gerar a imagem");
    } finally {
      setSharing(false);
      setTimeout(() => setFeedback(null), 3200);
    }
  };

  return (
    <section
      id="vip-area"
      className="relative border-t border-gea-cream/10 bg-gea-black px-6 py-32 md:py-40"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col items-center text-center">
          <span className="text-[0.55rem] uppercase tracking-[0.5em] text-gea-sunset/70">
            Área reservada
          </span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="mt-6 font-display text-[clamp(2rem,5vw,3.4rem)] italic text-gea-cream"
          >
            Meu Selo VIP
          </motion.h2>
          <p className="mt-6 max-w-md text-[0.7rem] uppercase tracking-[0.36em] text-gea-cream/50">
            {vip.name ? `Bem-vindo, ${vip.name.split(" ")[0]}.` : "Bem-vindo aos Primeiros da GEA."}
            <br />
            Desde {formatUnlockDate(vip.unlockedAt)} · Nº {vip.memberId}
          </p>
        </div>

        <div className="mt-16 grid gap-12 md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] md:items-center">
          {/* Cartão */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.96 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex justify-center"
          >
            <VipCard name={vip.name} memberId={vip.memberId} unlockedAt={vip.unlockedAt} />
          </motion.div>

          {/* Benefícios */}
          <div>
            <span className="text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/45">
              Recompensas desbloqueadas
            </span>
            <ul className="mt-6 grid gap-3">
              {BENEFITS.map((b) => (
                <li
                  key={b.label}
                  className="flex items-center justify-between border-b border-gea-cream/10 py-3 text-[0.72rem] uppercase tracking-[0.24em] text-gea-cream/75"
                >
                  <span className="flex items-center gap-3">
                    <span
                      className="inline-block h-[6px] w-[6px]"
                      style={{ background: b.unlocked ? "rgba(232,138,58,1)" : "rgba(220,220,220,0.25)" }}
                    />
                    {b.label}
                  </span>
                  <span
                    className="text-[0.55rem] tracking-[0.4em]"
                    style={{ color: b.unlocked ? "rgba(232,138,58,0.85)" : "rgba(220,220,220,0.35)" }}
                  >
                    {b.unlocked ? "Ativo" : "Em breve"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Countdown compacto */}
        <div className="mx-auto mt-20 max-w-md">
          <div className="flex items-center justify-between text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/50">
            <span>Próximo drop</span>
            <span className="tabular-nums text-gea-sunset">68%</span>
          </div>
        </div>


        {/* Stats + Ações */}
        <div className="mt-16 grid gap-10 md:grid-cols-3 md:items-end">
          <div className="text-center md:text-left">
            <div className="text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/45">
              Amigos convidados
            </div>
            <div
              className="mt-2 text-3xl tabular-nums text-gea-cream"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              {pad(vip.invitedCount)}
            </div>
          </div>

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={handleShare}
              disabled={sharing}
              className="inline-flex items-center gap-3 border border-gea-cream/30 bg-transparent px-8 py-4 text-[0.68rem] uppercase tracking-[0.36em] text-gea-cream transition-all duration-500 hover:border-gea-sunset hover:bg-gea-sunset hover:text-gea-black disabled:opacity-50"
            >
              {sharing ? "Gerando..." : "Compartilhar meu Selo VIP"}
              <span>→</span>
            </button>
            {feedback && (
              <span className="text-[0.55rem] uppercase tracking-[0.4em] text-gea-sunset/80">
                {feedback}
              </span>
            )}
          </div>

          <div className="text-center md:text-right">
            <a
              href={IG_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[0.65rem] uppercase tracking-[0.36em] text-gea-cream/60 transition-colors hover:text-gea-sunset"
            >
              Novidades no Instagram →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
