import { forwardRef, useEffect, useState } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { formatUnlockDate } from "@/lib/vip";

type Props = {
  name: string | null;
  memberId: string;
  unlockedAt: string | null;
  /** Modo estático para exportar como imagem (sem animações). */
  exportMode?: boolean;
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
 * Cartão Clube GEA — inspirado no cartão de visita oficial da marca.
 * Frente: logo GEA + dados do membro. Verso: cupom de 10% de boas-vindas.
 * Vira em 360° ao clique/toque.
 */
export const VipCard = forwardRef<HTMLDivElement, Props>(function VipCard(
  { name, memberId, unlockedAt, exportMode = false },
  ref
) {
  const [flipped, setFlipped] = useState(false);
  const prefersReduced = useReducedMotion();
  const animateOn = !exportMode && !prefersReduced;
  const displayName = (name || "MEMBRO EXCLUSIVO").toUpperCase();
  const couponCode = memberId ? `GEA10-${memberId}` : "GEA10-----";

  // Angulo mestre da rotação — dirige rotateY, brilho e sombra
  const angle = useMotionValue(0);

  useEffect(() => {
    if (!animateOn) {
      angle.set(flipped ? 360 : 0);
      return;
    }
    const controls = animate(angle, flipped ? 360 : 0, {
      duration: 2.6,
      ease: [0.16, 0.84, 0.24, 1],
    });
    return () => controls.stop();
  }, [flipped, animateOn, angle]);

  // Derivações cinematográficas do ângulo
  const rotateY = useTransform(angle, (a) => `${a}deg`);
  // Leve inclinação em X: sobe no meio do giro (efeito de "levantar" o cartão)
  const rotateX = useTransform(angle, (a) => `${-Math.sin((a * Math.PI) / 180) * 6}deg`);
  // Dip de escala no meio do flip (perspectiva cinematográfica)
  const scale = useTransform(angle, (a) => 1 - Math.abs(Math.sin((a * Math.PI) / 180)) * 0.04);
  // Sombra projetada — mais forte e deslocada quando o cartão está de perfil
  const boxShadow = useTransform(angle, (a) => {
    const s = Math.abs(Math.sin((a * Math.PI) / 180));
    const yOff = 40 + s * 60;
    const blur = 100 + s * 80;
    const spread = -40 + s * 10;
    const alpha = 0.55 + s * 0.35;
    return `0 ${yOff}px ${blur}px ${spread}px rgba(0,0,0,${alpha.toFixed(2)}), 0 0 0 1px rgba(200,200,200,0.06)`;
  });
  // Varredura de brilho especular acompanhando o giro (0% → 100%)
  const shineX = useTransform(angle, [0, 360], ["-30%", "130%"]);
  const shineOpacity = useTransform(angle, (a) => {
    const s = Math.abs(Math.sin((a * Math.PI) / 180));
    return 0.05 + s * 0.35;
  });

  return (
    <motion.div
      className="w-full max-w-md"
      initial={animateOn ? { opacity: 0, y: 24, scale: 0.97 } : false}
      whileInView={animateOn ? { opacity: 1, y: 0, scale: 1 } : undefined}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={animateOn ? { y: -4 } : undefined}
      whileTap={animateOn ? { scale: 0.995 } : undefined}
    >
      <div
        ref={ref}
        role={exportMode ? undefined : "button"}
        tabIndex={exportMode ? -1 : 0}
        aria-label={exportMode ? undefined : "Virar cartão"}
        onClick={() => !exportMode && setFlipped((f) => !f)}
        onKeyDown={(e) => {
          if (exportMode) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setFlipped((f) => !f);
          }
        }}
        className="relative aspect-[1.75/1] w-full cursor-pointer select-none [perspective:2000px] focus:outline-none"
        style={{ perspectiveOrigin: "50% 40%" }}
      >
        <motion.div
          className="relative h-full w-full [transform-style:preserve-3d]"
          style={{
            rotateY,
            rotateX,
            scale,
            boxShadow: exportMode ? undefined : boxShadow,
            borderRadius: 14,
          }}
        >
          {/* Varredura especular global — acompanha o ângulo */}
          {!exportMode && (
            <motion.div
              aria-hidden
              className="pointer-events-none absolute inset-0 overflow-hidden rounded-[14px]"
              style={{ opacity: shineOpacity }}
            >
              <motion.div
                className="absolute inset-y-[-20%] w-[45%]"
                style={{
                  left: shineX,
                  background:
                    "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.55) 50%, transparent 100%)",
                  filter: "blur(10px)",
                  transform: "translateZ(1px)",
                }}
              />
            </motion.div>
          )}
          {/* FRENTE */}
          <CardFace exportMode={exportMode}>
            <div className="relative flex h-full items-stretch px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex flex-1 items-center justify-center">
                <div
                  className="text-5xl leading-none sm:text-6xl"
                  style={{
                    ...silverText,
                    fontWeight: 400,
                    letterSpacing: "0.04em",
                    textShadow: exportMode
                      ? undefined
                      : "0 1px 0 rgba(255,255,255,0.08), 0 -1px 0 rgba(0,0,0,0.6)",
                  }}
                >
                  GEA
                </div>
              </div>

              <VerticalDivider />

              <div className="flex flex-[1.4] flex-col justify-center gap-3">
                <div>
                  <div
                    className="text-[0.85rem] leading-tight sm:text-[0.95rem]"
                    style={{ ...silverText, fontWeight: 500, letterSpacing: "0.08em" }}
                  >
                    {displayName}
                  </div>
                  <div
                    className="mt-1 text-[0.5rem] uppercase"
                    style={{
                      letterSpacing: "0.42em",
                      color: "rgba(200,200,200,0.5)",
                      fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    }}
                  >
                    Membro Exclusivo GEA
                  </div>
                </div>

                <HairLine />

                <ul
                  className="flex flex-col gap-1.5 text-[0.68rem] sm:text-[0.72rem]"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    color: "rgba(230,230,230,0.85)",
                    letterSpacing: "0.08em",
                  }}
                >
                  <li className="flex items-center gap-2">
                    <Dot />
                    <span className="tabular-nums">Nº {memberId || "----"}</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Dot />
                    <span>@geastoree</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Dot />
                    <span>Desde {formatUnlockDate(unlockedAt)}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardFace>

          {/* VERSO */}
          <CardFace exportMode={exportMode} back>
            <div className="relative flex h-full flex-col justify-between px-6 py-6 sm:px-8 sm:py-7">
              <div className="flex items-start justify-between">
                <span
                  className="text-[0.5rem] uppercase"
                  style={{
                    letterSpacing: "0.5em",
                    color: "rgba(200,200,200,0.55)",
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Clube GEA · Verso
                </span>
                <span
                  className="text-xl"
                  style={{ ...silverText, fontWeight: 400, letterSpacing: "0.04em" }}
                >
                  GEA
                </span>
              </div>

              <div className="flex flex-col items-center text-center">
                <div
                  className="text-[0.55rem] uppercase"
                  style={{
                    letterSpacing: "0.5em",
                    color: "rgba(232,138,58,0.85)",
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Benefício de boas-vindas
                </div>
                <div
                  className="mt-2 leading-none"
                  style={{
                    ...silverText,
                    fontWeight: 500,
                    fontSize: "clamp(2.2rem, 6vw, 3rem)",
                    letterSpacing: "0.02em",
                  }}
                >
                  10% OFF
                </div>
                <div
                  className="mt-1 text-[0.55rem] uppercase"
                  style={{
                    letterSpacing: "0.42em",
                    color: "rgba(220,220,220,0.6)",
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  no seu primeiro pedido
                </div>

                <div
                  className="mt-3 border border-dashed px-3 py-1 text-[0.7rem] tabular-nums"
                  style={{
                    borderColor: "rgba(210,210,210,0.35)",
                    color: "rgba(240,240,240,0.9)",
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    letterSpacing: "0.18em",
                  }}
                >
                  {couponCode}
                </div>
              </div>

              <p
                className="text-center text-[0.5rem] uppercase leading-[1.6]"
                style={{
                  letterSpacing: "0.32em",
                  color: "rgba(200,200,200,0.5)",
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Válido apenas com o número do cartão · Uso único · Intransferível
              </p>
            </div>
          </CardFace>
        </div>
      </div>

      {!exportMode && (
        <div className="mt-4 flex items-center justify-center gap-2 text-[0.5rem] uppercase tracking-[0.42em] text-gea-cream/40">
          <span className="inline-block h-px w-6 bg-gea-cream/20" />
          {flipped ? "Toque para ver a frente" : "Toque para ver o verso"}
          <span className="inline-block h-px w-6 bg-gea-cream/20" />
        </div>
      )}
    </motion.div>
  );
});

function CardFace({
  children,
  exportMode,
  back = false,
}: {
  children: React.ReactNode;
  exportMode: boolean;
  back?: boolean;
}) {
  return (
    <div
      className="absolute inset-0 overflow-hidden rounded-[14px] [backface-visibility:hidden]"
      style={{
        transform: back ? "rotateY(180deg)" : undefined,
        background:
          "radial-gradient(120% 100% at 30% 20%, #141414 0%, #0a0a0a 55%, #050505 100%)",
        boxShadow: exportMode
          ? "none"
          : "0 40px 100px -40px rgba(0,0,0,0.95), 0 0 0 1px rgba(200,200,200,0.06)",
      }}
    >
      {/* Textura de papel fosco */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.35] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.4) 1px, transparent 1px)",
          backgroundSize: "3px 3px, 5px 5px",
          backgroundPosition: "0 0, 1px 2px",
        }}
      />
      {/* Luz superior sutil */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(160deg, rgba(255,255,255,0.05) 0%, transparent 45%)",
        }}
      />
      {children}
      {!exportMode && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 42%, rgba(255,255,255,0.05) 50%, transparent 58%)",
          }}
        />
      )}
    </div>
  );
}

function VerticalDivider() {
  return (
    <div
      aria-hidden
      className="mx-4 w-px shrink-0 self-stretch sm:mx-6"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, rgba(210,210,210,0.55) 20%, rgba(210,210,210,0.55) 80%, transparent 100%)",
      }}
    />
  );
}

function HairLine() {
  return (
    <div
      aria-hidden
      className="h-px w-full"
      style={{
        background: "linear-gradient(90deg, rgba(210,210,210,0.35), transparent)",
      }}
    />
  );
}

function Dot() {
  return (
    <span
      aria-hidden
      className="inline-block h-[5px] w-[5px] shrink-0 rounded-full"
      style={{
        background:
          "radial-gradient(circle at 30% 30%, #f0f0f0 0%, #9a9a9a 60%, #4a4a4a 100%)",
        boxShadow: "0 0 4px rgba(220,220,220,0.25)",
      }}
    />
  );
}
