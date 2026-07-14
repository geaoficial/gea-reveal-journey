import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useVip } from "@/lib/vip";
import { VipCard } from "./VipCard";

const BENEFITS = [
  "Acesso antecipado às coleções",
  "Ofertas exclusivas para membros VIP",
  "Cupons especiais de inauguração",
  "Sorteios exclusivos",
  "Convites para campanhas especiais",
  "Benefícios reservados à comunidade GEA",
];

/**
 * Overlay cinematográfico de desbloqueio do Selo VIP GEA.
 * Aparece uma única vez, logo após o retorno do Instagram.
 */
export function VipUnlockOverlay() {
  const vip = useVip();
  const [nameDraft, setNameDraft] = useState("");
  const [step, setStep] = useState<"reveal" | "name" | "done">("reveal");

  useEffect(() => {
    if (!vip.justUnlocked) return;
    setStep("reveal");
    setNameDraft(vip.name ?? "");
    const t1 = setTimeout(() => setStep((s) => (s === "reveal" ? "name" : s)), 3600);
    return () => clearTimeout(t1);
  }, [vip.justUnlocked, vip.name]);

  const handleClose = () => {
    if (nameDraft.trim()) vip.setName(nameDraft);
    vip.dismissUnlock();
    // rolar até a área VIP
    setTimeout(() => {
      document.getElementById("vip-area")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 400);
  };

  return (
    <AnimatePresence>
      {vip.justUnlocked && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-gea-black/95 px-6 py-16 backdrop-blur-xl"
          aria-modal
          role="dialog"
        >
          {/* Halo prateado */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(closest-side at 50% 45%, rgba(220,220,220,0.18) 0%, transparent 55%), radial-gradient(closest-side at 50% 45%, rgba(232,138,58,0.12) 0%, transparent 70%)",
            }}
          />
          {/* Feixe de luz */}
          <motion.div
            aria-hidden
            initial={{ opacity: 0, rotate: -8, y: 40 }}
            animate={{ opacity: [0, 0.35, 0.15], rotate: -8, y: 0 }}
            transition={{ duration: 3.2, times: [0, 0.4, 1] }}
            className="pointer-events-none absolute inset-y-0 left-1/2 w-[60vw] -translate-x-1/2"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.14) 50%, rgba(255,255,255,0.08) 55%, transparent)",
              filter: "blur(24px)",
            }}
          />

          <div className="relative mx-auto flex w-full max-w-lg flex-col items-center text-center">
            {/* Logo GEA emergindo */}
            <motion.div
              initial={{ opacity: 0, y: 16, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.28em" }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(3rem,10vw,5rem)]"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontWeight: 500,
                background:
                  "linear-gradient(180deg, #ffffff 0%, #c8c8c8 55%, #7d7d7d 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              GEA
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.4 }}
              className="mt-3 text-[0.55rem] uppercase tracking-[0.5em] text-gea-sunset/80"
            >
              Selo VIP · Desbloqueado
            </motion.span>

            {/* Cartão VIP entrando */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: -8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
              transition={{ duration: 1.6, delay: 1.6, ease: [0.22, 1, 0.36, 1] }}
              className="mt-10 w-full"
              style={{ perspective: 1200 }}
            >
              <VipCard
                name={nameDraft.trim() || vip.name}
                memberId={vip.memberId}
                unlockedAt={vip.unlockedAt}
              />
            </motion.div>

            {/* Mensagens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.4, delay: 2.4 }}
              className="mt-10 space-y-3"
            >
              <p className="font-display text-2xl italic text-gea-cream sm:text-3xl">
                Parabéns.
              </p>
              <p className="text-sm uppercase tracking-[0.36em] text-gea-cream/70">
                Você desbloqueou o Selo VIP GEA
              </p>
              <p className="text-xs uppercase tracking-[0.36em] text-gea-cream/50">
                Agora você faz parte dos Primeiros da GEA
              </p>
            </motion.div>

            {/* Nome */}
            <AnimatePresence>
              {step !== "reveal" && (
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="mt-10 w-full max-w-xs"
                >
                  <label className="mb-3 block text-[0.55rem] uppercase tracking-[0.5em] text-gea-cream/50">
                    Como devemos te chamar?
                  </label>
                  <input
                    type="text"
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    maxLength={32}
                    placeholder="Seu nome"
                    className="w-full border-b border-gea-cream/25 bg-transparent px-1 py-2 text-center text-sm uppercase tracking-[0.24em] text-gea-cream placeholder:text-gea-cream/25 focus:border-gea-sunset focus:outline-none"
                  />
                  <p className="mt-3 text-[0.55rem] uppercase tracking-[0.4em] text-gea-cream/35">
                    Opcional · usado no seu cartão
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Benefícios */}
            <motion.ul
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 2.8 }}
              className="mt-12 grid w-full gap-3 text-left sm:grid-cols-2"
            >
              {BENEFITS.map((b, i) => (
                <motion.li
                  key={b}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 3 + i * 0.12 }}
                  className="flex items-start gap-3 text-[0.7rem] uppercase tracking-[0.24em] text-gea-cream/70"
                >
                  <span className="mt-[6px] inline-block h-[6px] w-[6px] flex-none bg-gea-sunset" />
                  {b}
                </motion.li>
              ))}
            </motion.ul>

            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 3.8 }}
              onClick={handleClose}
              className="mt-14 inline-flex items-center gap-3 border border-gea-cream/30 px-8 py-4 text-[0.68rem] uppercase tracking-[0.36em] text-gea-cream transition-all duration-500 hover:border-gea-sunset hover:bg-gea-sunset hover:text-gea-black"
            >
              Entrar na área VIP
              <span>→</span>
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
