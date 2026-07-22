import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { readConsent, writeConsent, useHydrated, type ConsentState } from "@/lib/consent";

type Cat = "performance" | "analytics" | "marketing";

const CATEGORIES: {
  key: Cat;
  title: string;
  description: string;
}[] = [
  {
    key: "performance",
    title: "Cookies de Desempenho",
    description:
      "Ajudam a medir tempos de carregamento e estabilidade da experiência. Nenhum dado pessoal é vinculado.",
  },
  {
    key: "analytics",
    title: "Cookies de Análise",
    description:
      "Google Analytics e ferramentas equivalentes para entender comportamento agregado dos visitantes.",
  },
  {
    key: "marketing",
    title: "Cookies de Marketing",
    description:
      "Meta Pixel, TikTok Pixel e integrações futuras para mensurar campanhas e criar públicos personalizados.",
  },
];

export function CookieConsent() {
  const hydrated = useHydrated();
  const [visible, setVisible] = useState(false);
  const [prefsOpen, setPrefsOpen] = useState(false);
  const [prefs, setPrefs] = useState<Record<Cat, boolean>>({
    performance: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    if (!hydrated) return;
    const existing = readConsent();
    if (!existing?.updatedAt) setVisible(true);
    else
      setPrefs({
        performance: existing.performance,
        analytics: existing.analytics,
        marketing: existing.marketing,
      });
    const openHandler = () => {
      const cur = readConsent();
      if (cur)
        setPrefs({
          performance: cur.performance,
          analytics: cur.analytics,
          marketing: cur.marketing,
        });
      setPrefsOpen(true);
      setVisible(true);
    };
    window.addEventListener("gea:open-consent", openHandler);
    return () => window.removeEventListener("gea:open-consent", openHandler);
  }, [hydrated]);

  const save = (state: Partial<ConsentState>) => {
    writeConsent(state);
    setVisible(false);
    setPrefsOpen(false);
  };

  const acceptAll = () => save({ performance: true, analytics: true, marketing: true });
  const essentialsOnly = () => save({ performance: false, analytics: false, marketing: false });
  const savePrefs = () => save(prefs);

  if (!hydrated) return null;

  return (
    <>
      <AnimatePresence>
        {visible && !prefsOpen && (
          <motion.div
            key="banner"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-4 z-[130] flex justify-center pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-3xl overflow-hidden rounded-[3px] border border-[#c9c9c9]/20 p-6 shadow-[0_30px_100px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl"
              style={{
                backgroundImage:
                  "linear-gradient(155deg, rgba(13,13,13,0.96) 0%, rgba(20,20,20,0.96) 45%, rgba(8,8,8,0.96) 100%)",
              }}
            >
              <div className="flex items-center gap-3">
                <span className="h-px w-8 bg-[#c9c9c9]/50" />
                <p
                  className="text-[0.55rem] uppercase tracking-[0.42em] text-[#8a8a8a]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Privacidade · GEA
                </p>
              </div>

              <p
                className="mt-4 text-[0.9rem] leading-relaxed text-[#c4c4c4]"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Utilizamos cookies para oferecer uma experiência personalizada, melhorar o
                desempenho do site e entender como nossa comunidade interage com a GEA. Você pode
                escolher quais categorias deseja permitir.{" "}
                <Link
                  to="/cookies"
                  className="underline underline-offset-4 decoration-[#c9c9c9]/40 hover:text-[#e8e8e8]"
                >
                  Política de Cookies
                </Link>
                .
              </p>

              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
                <button
                  type="button"
                  onClick={() => setPrefsOpen(true)}
                  className="rounded-[2px] px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.32em] text-[#a8a8a8] transition-colors hover:text-[#e8e8e8]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Personalizar
                </button>
                <button
                  type="button"
                  onClick={essentialsOnly}
                  className="rounded-[2px] border border-[#c9c9c9]/25 px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.32em] text-[#c4c4c4] transition-all hover:border-[#c9c9c9]/50 hover:text-[#efefef]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Apenas essenciais
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-[2px] bg-[#e8e8e8] px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.32em] text-[#0a0a0a] transition-all hover:bg-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  Aceitar todos
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {prefsOpen && (
          <motion.div
            className="fixed inset-0 z-[140] flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/85 backdrop-blur-md"
              onClick={() => setPrefsOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="consent-prefs-title"
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-lg overflow-hidden rounded-[3px] border border-[#c9c9c9]/20 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.9)]"
              style={{
                backgroundImage: "linear-gradient(155deg, #0d0d0d 0%, #141414 45%, #080808 100%)",
              }}
            >
              <div className="max-h-[80vh] overflow-y-auto p-8">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-[#c9c9c9]/50" />
                  <p
                    id="consent-prefs-title"
                    className="text-[0.55rem] uppercase tracking-[0.42em] text-[#8a8a8a]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Preferências de Privacidade
                  </p>
                </div>

                <h2
                  className="mt-4 text-2xl font-light text-[#efefef]"
                  style={{ fontFamily: "'Instrument Serif', serif" }}
                >
                  Controle o que rastreamos
                </h2>

                <div className="mt-8 space-y-4">
                  <CategoryRow
                    title="Cookies Essenciais"
                    description="Necessários para o funcionamento do site, sessão do clube VIP e segurança. Não podem ser desativados."
                    checked
                    disabled
                  />
                  {CATEGORIES.map((c) => (
                    <CategoryRow
                      key={c.key}
                      title={c.title}
                      description={c.description}
                      checked={prefs[c.key]}
                      onChange={(v) => setPrefs((p) => ({ ...p, [c.key]: v }))}
                    />
                  ))}
                </div>

                <div className="mt-8 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={essentialsOnly}
                    className="rounded-[2px] px-4 py-2.5 text-[0.65rem] uppercase tracking-[0.32em] text-[#a8a8a8] transition-colors hover:text-[#e8e8e8]"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Rejeitar não essenciais
                  </button>
                  <button
                    type="button"
                    onClick={savePrefs}
                    className="rounded-[2px] bg-[#e8e8e8] px-5 py-2.5 text-[0.65rem] uppercase tracking-[0.32em] text-[#0a0a0a] transition-all hover:bg-white"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    Salvar preferências
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function CategoryRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-4 border-t border-white/5 pt-4 first:border-t-0 first:pt-0">
      <div className="flex-1">
        <h3
          className="text-[0.78rem] uppercase tracking-[0.24em] text-[#e0e0e0]"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          {title}
        </h3>
        <p
          className="mt-1.5 text-[0.78rem] leading-relaxed text-[#8a8a8a]"
          style={{ fontFamily: "'Inter', sans-serif" }}
        >
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        disabled={disabled}
        onClick={() => onChange?.(!checked)}
        className={`relative mt-1 h-5 w-9 shrink-0 rounded-full border transition-colors ${
          checked ? "border-[#c9c9c9]/60 bg-[#c9c9c9]/25" : "border-white/15 bg-white/5"
        } ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span
          className={`absolute top-1/2 -translate-y-1/2 h-3.5 w-3.5 rounded-full transition-all ${
            checked ? "left-[calc(100%-1.05rem)] bg-[#efefef]" : "left-0.5 bg-[#8a8a8a]"
          }`}
        />
      </button>
    </div>
  );
}
