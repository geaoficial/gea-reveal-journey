import { forwardRef } from "react";
import { formatUnlockDate } from "@/lib/vip";

type Props = {
  name: string | null;
  memberId: string;
  unlockedAt: string | null;
  /** Modo estático para exportar como imagem (sem animações). */
  exportMode?: boolean;
};

/**
 * Cartão VIP GEA — preto fosco, detalhes em prata, aparência premium.
 * Usa `forwardRef` para permitir captura em canvas (compartilhamento).
 */
export const VipCard = forwardRef<HTMLDivElement, Props>(function VipCard(
  { name, memberId, unlockedAt, exportMode = false },
  ref
) {
  return (
    <div
      ref={ref}
      className="relative aspect-[1.586/1] w-full max-w-md overflow-hidden"
      style={{
        background:
          "linear-gradient(140deg, #0a0a0a 0%, #141414 45%, #050505 100%)",
        boxShadow: exportMode
          ? "none"
          : "0 30px 80px -30px rgba(0,0,0,0.9), 0 0 0 1px rgba(200,200,200,0.08)",
      }}
    >
      {/* Textura metálica sutil */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.18]"
        style={{
          background:
            "radial-gradient(120% 90% at 15% 10%, rgba(220,220,220,0.35) 0%, transparent 55%), radial-gradient(90% 70% at 85% 90%, rgba(232,138,58,0.18) 0%, transparent 60%)",
          mixBlendMode: "screen",
        }}
      />
      {/* Padrão guilhoché discreto */}
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, rgba(255,255,255,0.6) 0 1px, transparent 1px 6px)",
        }}
      />
      {/* Moldura prateada */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[6px] border"
        style={{
          borderColor: "rgba(200,200,200,0.22)",
        }}
      />

      <div className="relative flex h-full flex-col justify-between p-6 sm:p-7">
        {/* Topo */}
        <div className="flex items-start justify-between">
          <div>
            <div
              className="text-[0.55rem] uppercase"
              style={{
                letterSpacing: "0.5em",
                color: "rgba(220,220,220,0.55)",
              }}
            >
              GEA · Est. 2024
            </div>
            <div
              className="mt-3 text-3xl sm:text-4xl"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 500,
                letterSpacing: "0.08em",
                background:
                  "linear-gradient(180deg, #f5f5f5 0%, #b8b8b8 55%, #7a7a7a 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              GEA
            </div>
          </div>

          <div
            className="text-right text-[0.55rem] uppercase"
            style={{
              letterSpacing: "0.4em",
              color: "rgba(220,220,220,0.55)",
            }}
          >
            <div>Selo</div>
            <div
              className="mt-1"
              style={{ color: "#e8e8e8", letterSpacing: "0.32em" }}
            >
              VIP MEMBER
            </div>
          </div>
        </div>

        {/* Meio — chip prateado */}
        <div className="flex items-center gap-4">
          <div
            className="relative h-9 w-12 sm:h-10 sm:w-14 overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #c9c9c9 0%, #7d7d7d 45%, #eaeaea 60%, #6b6b6b 100%)",
              borderRadius: 3,
            }}
          >
            <div
              aria-hidden
              className="absolute inset-[3px]"
              style={{
                background:
                  "repeating-linear-gradient(0deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.35) 0 1px, transparent 1px 4px)",
                mixBlendMode: "multiply",
              }}
            />
          </div>
          <div
            className="text-[0.6rem] uppercase"
            style={{
              letterSpacing: "0.42em",
              color: "rgba(232,138,58,0.85)",
            }}
          >
            Primeiros da GEA
          </div>
        </div>

        {/* Rodapé */}
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <div
              className="text-[0.5rem] uppercase"
              style={{
                letterSpacing: "0.5em",
                color: "rgba(220,220,220,0.45)",
              }}
            >
              Membro
            </div>
            <div
              className="mt-1 truncate text-sm sm:text-base"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: "#f0f0f0",
                letterSpacing: "0.12em",
              }}
            >
              {(name || "Anônimo").toUpperCase()}
            </div>
          </div>
          <div className="text-right">
            <div
              className="text-[0.5rem] uppercase"
              style={{
                letterSpacing: "0.5em",
                color: "rgba(220,220,220,0.45)",
              }}
            >
              Nº · Desde
            </div>
            <div
              className="mt-1 text-sm sm:text-base tabular-nums"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                color: "#f0f0f0",
                letterSpacing: "0.1em",
              }}
            >
              {memberId ? memberId : "----"} · {formatUnlockDate(unlockedAt)}
            </div>
          </div>
        </div>
      </div>

      {/* Reflexo diagonal */}
      {!exportMode && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.06) 50%, transparent 60%)",
          }}
        />
      )}
    </div>
  );
});
