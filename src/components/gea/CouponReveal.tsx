import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

type Benefit = {
  title: string;
  description: string | null;
  code: string | null;
  unlocked: boolean;
} | null;

function track(name: string, props?: Record<string, string | number | boolean>) {
  try {
    (window as unknown as {
      plausible?: (n: string, o?: { props?: Record<string, unknown> }) => void;
    }).plausible?.(name, props ? { props } : undefined);
  } catch { /* ignore */ }
}

/**
 * Painel inline com o cupom desbloqueado + ação de resgate imediato.
 * Aparece logo abaixo do cartão VIP após as duas ações concluírem.
 */
export function CouponRedeemPanel({
  benefit,
  memberId,
}: {
  benefit: NonNullable<Benefit>;
  memberId: string;
}) {
  const code = benefit.code ?? "GEA10";
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      track("Vip Coupon Copy", { memberId, code });
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  function redeem() {
    track("Vip Coupon Redeem Click", { memberId, code });
    window.open("https://instagram.com/geastoree", "_blank", "noopener,noreferrer");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="mt-6 overflow-hidden rounded-2xl border border-amber-400/25 bg-gradient-to-br from-amber-500/[0.09] via-amber-500/[0.03] to-transparent p-6"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80">
            Seu cupom
          </p>
          <h3 className="mt-1 font-display text-xl text-white">{benefit.title}</h3>
          {benefit.description && (
            <p className="mt-1 text-[11px] tracking-wide text-white/50">
              {benefit.description}
            </p>
          )}
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.3em] text-emerald-300">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Ativo
        </span>
      </div>

      <button
        type="button"
        onClick={copy}
        className="mt-5 group flex w-full items-center justify-between rounded-xl border border-white/15 bg-black/60 px-5 py-4 font-mono text-lg tracking-[0.35em] text-white transition hover:border-amber-400/40 hover:bg-black/80"
        aria-label="Copiar cupom"
      >
        <span className="truncate">{code}</span>
        <span className="ml-4 shrink-0 text-[10px] uppercase tracking-[0.35em] text-amber-300/80 group-hover:text-amber-300">
          {copied ? "Copiado ✓" : "Copiar"}
        </span>
      </button>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={redeem}
          className="flex-1 rounded-full bg-white px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-black transition hover:bg-amber-100"
        >
          Resgatar agora
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded-full border border-white/20 px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-white/80 transition hover:border-white/50 hover:text-white"
        >
          {copied ? "Cupom copiado" : "Copiar código"}
        </button>
      </div>

      <p className="mt-3 text-[10px] leading-relaxed tracking-wide text-white/40">
        Envie o código pelo direct do @geastoree ao pedir sua peça. Válido apenas
        para membros com número do cartão.
      </p>
    </motion.div>
  );
}

/**
 * Overlay cinematográfico único que celebra o desbloqueio e permite copiar
 * ou resgatar o cupom imediatamente. Aparece apenas quando `open` é true.
 */
export function CouponUnlockOverlay({
  open,
  onClose,
  benefit,
  memberId,
}: {
  open: boolean;
  onClose: () => void;
  benefit: NonNullable<Benefit>;
  memberId: string;
}) {
  const code = benefit.code ?? "GEA10";
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    track("Vip Coupon Reveal Shown", { memberId, code });
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, memberId, code, onClose]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      track("Vip Coupon Copy", { memberId, code, source: "overlay" });
      setTimeout(() => setCopied(false), 1800);
    } catch { /* ignore */ }
  }

  function redeem() {
    track("Vip Coupon Redeem Click", { memberId, code, source: "overlay" });
    window.open("https://instagram.com/geastoree", "_blank", "noopener,noreferrer");
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Cupom desbloqueado"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 px-6 backdrop-blur"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-amber-400/30 bg-gradient-to-b from-neutral-950 to-black p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-70"
              style={{
                background:
                  "radial-gradient(ellipse 70% 45% at 50% 0%, rgba(232,138,58,0.35), transparent 70%)",
              }}
            />
            <button
              type="button"
              onClick={onClose}
              className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.35em] text-white/40 transition hover:text-white/80"
              aria-label="Fechar"
            >
              Fechar
            </button>

            <p className="relative text-[10px] uppercase tracking-[0.5em] text-amber-300/80">
              Cartão desbloqueado
            </p>
            <h2 className="relative mt-4 font-display text-3xl text-white">
              {benefit.title}
            </h2>
            {benefit.description && (
              <p className="relative mt-2 text-xs tracking-wide text-white/60">
                {benefit.description}
              </p>
            )}

            <button
              type="button"
              onClick={copy}
              className="relative mt-6 flex w-full items-center justify-between rounded-xl border border-white/15 bg-black/60 px-5 py-4 font-mono text-lg tracking-[0.35em] text-white transition hover:border-amber-400/40"
            >
              <span className="truncate">{code}</span>
              <span className="ml-4 shrink-0 text-[10px] uppercase tracking-[0.35em] text-amber-300/80">
                {copied ? "Copiado ✓" : "Copiar"}
              </span>
            </button>

            <div className="relative mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={redeem}
                className="rounded-full bg-white px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-black transition hover:bg-amber-100"
              >
                Resgatar agora no direct
              </button>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-white/15 px-5 py-3 text-[11px] uppercase tracking-[0.35em] text-white/70 transition hover:border-white/40 hover:text-white"
              >
                Ver depois
              </button>
            </div>

            <p className="relative mt-4 text-[10px] leading-relaxed tracking-wide text-white/40">
              O cupom fica salvo no verso do seu cartão e no seu painel VIP.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
