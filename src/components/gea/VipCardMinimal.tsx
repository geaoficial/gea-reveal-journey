import { memo } from "react";
import { motion, useReducedMotion } from "motion/react";
import { formatUnlockDate } from "@/lib/vip";

type Props = {
  name: string | null;
  memberId: string;
  unlockedAt: string | null;
};

const silverText: React.CSSProperties = {
  background:
    "linear-gradient(180deg, #f4f4f4 0%, #d4d4d4 40%, #8a8a8a 70%, #cfcfcf 100%)",
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  fontFamily: "'Space Grotesk', system-ui, sans-serif",
};

/**
 * Cartão VIP GEA — versão minimalista para o novo fluxo simplificado.
 * Preto absoluto, detalhes em prata, apenas um brilho especular discreto.
 */
export const VipCardMinimal = memo(function VipCardMinimal({
  name,
  memberId,
  unlockedAt,
}: Props) {
  const prefersReduced = useReducedMotion();
  const trimmed = (name || "").trim();
  const displayName = (trimmed || "MEMBRO GEA").toUpperCase();

  return (
    <motion.div
      className="w-full max-w-md"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="relative aspect-[1.75/1] w-full overflow-hidden rounded-[14px]"
        style={{
          background:
            "radial-gradient(120% 100% at 30% 20%, #141414 0%, #0a0a0a 55%, #050505 100%)",
          boxShadow:
            "0 40px 100px -40px rgba(0,0,0,0.95), 0 0 0 1px rgba(200,200,200,0.08)",
        }}
      >
        {/* Textura fosca */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.3] mix-blend-overlay"
          style={{
            backgroundImage:
              "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)",
            backgroundSize: "3px 3px, 5px 5px",
            backgroundPosition: "0 0, 1px 2px",
          }}
        />
        {/* Luz superior */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 45%)",
          }}
        />
        {/* Brilho especular discreto — única animação */}
        {!prefersReduced && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 w-[45%]"
            initial={{ x: "-60%", opacity: 0 }}
            animate={{ x: ["-60%", "220%"], opacity: [0, 0.25, 0] }}
            transition={{ duration: 3.6, ease: "easeInOut", repeat: Infinity, repeatDelay: 5 }}
            style={{
              background:
                "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
              filter: "blur(10px)",
              willChange: "transform, opacity",
            }}
          />
        )}

        {/* Conteúdo */}
        <div className="relative flex h-full flex-col justify-between px-6 py-5">
          <div className="flex items-start justify-between">
            <span
              className="text-4xl leading-none"
              style={{ ...silverText, fontWeight: 400, letterSpacing: "0.06em" }}
            >
              GEA
            </span>
            <span
              className="rounded-full border px-2.5 py-0.5 text-[9px] uppercase"
              style={{
                borderColor: "rgba(210,210,210,0.4)",
                color: "rgba(220,220,220,0.85)",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                letterSpacing: "0.4em",
              }}
            >
              VIP
            </span>
          </div>

          <div
            aria-hidden
            className="h-px w-full"
            style={{
              background:
                "linear-gradient(90deg, rgba(210,210,210,0.35), transparent)",
            }}
          />

          <div className="flex items-end justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div
                className="truncate text-[0.9rem] leading-tight"
                style={{ ...silverText, fontWeight: 500, letterSpacing: "0.08em" }}
              >
                {displayName}
              </div>
              <div
                className="mt-1 text-[0.5rem] uppercase"
                style={{
                  letterSpacing: "0.42em",
                  color: "rgba(200,200,200,0.55)",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Desde {formatUnlockDate(unlockedAt)}
              </div>
            </div>
            <div className="shrink-0 text-right">
              <div
                className="text-[0.5rem] uppercase"
                style={{
                  letterSpacing: "0.42em",
                  color: "rgba(200,200,200,0.5)",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Membro
              </div>
              <div
                className="mt-1 text-lg tabular-nums leading-none"
                style={{ ...silverText, fontWeight: 500, letterSpacing: "0.14em" }}
              >
                Nº {memberId || "----"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
