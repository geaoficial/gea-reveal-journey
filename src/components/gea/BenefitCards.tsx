import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type Benefit = {
  id: string;
  title: string;
  short: string;
  detail: string;
};

const BENEFITS: Benefit[] = [
  {
    id: "early",
    title: "Acesso antecipado aos drops",
    short: "Seja o primeiro a ver e comprar antes de todos.",
    detail:
      "Cada peça GEA nasce em edições limitadas. Quem segue o Instagram recebe o aviso do drop com horas de antecedência, com link direto para garantir a sua antes que o público geral tenha acesso. Sem filas, sem sobra, sem espera.",
  },
  {
    id: "backstage",
    title: "Bastidores exclusivos",
    short: "Os detalhes que não vão para o feed público.",
    detail:
      "Você acompanha os ensaios, os testes de materiais, as viagens e os processos criativos antes de qualquer campanha ir ao ar. É a GEA por dentro — o pensamento, a estética e o comportamento que constroem cada coleção.",
  },
  {
    id: "vip",
    title: "Selo VIP exclusivo",
    short: "Sua identidade dentro da comunidade GEA.",
    detail:
      "Ao seguir a marca, você desbloqueia o Selo VIP GEA: um cartão digital numerado que marca sua entrada na comunidade. Ele dá prioridade em lançamentos, benefícios silenciosos e reconhecimento como parte dos primeiros que acreditaram na marca.",
  },
];

export function BenefitCards() {
  const [open, setOpen] = useState<Benefit | null>(null);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 1, delay: 0.2 }}
        className="mx-auto mt-14 grid max-w-4xl gap-4 px-2 sm:grid-cols-3"
      >
        {BENEFITS.map((b, i) => (
          <button
            key={b.id}
            type="button"
            onClick={() => setOpen(b)}
            className="plausible-event-name=Benefit+Open group relative flex flex-col justify-between overflow-hidden border border-gea-cream/15 bg-gea-cream/[0.02] p-6 text-left transition-all duration-500 hover:border-gea-sunset/60 hover:bg-gea-cream/[0.04]"
          >
            <span className="text-[0.6rem] uppercase tracking-[0.5em] text-gea-sunset/70">
              0{i + 1}
            </span>
            <span className="mt-8 block text-sm uppercase tracking-[0.24em] text-gea-cream">
              {b.title}
            </span>
            <span className="mt-3 block text-xs leading-relaxed text-gea-cream/55">
              {b.short}
            </span>
            <span className="mt-6 flex items-center gap-2 text-[0.6rem] uppercase tracking-[0.4em] text-gea-cream/40 transition-colors duration-500 group-hover:text-gea-sunset">
              Ler mais
              <span className="transition-transform duration-500 group-hover:translate-x-1">
                →
              </span>
            </span>
          </button>
        ))}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-[80] flex items-center justify-center bg-gea-black/85 px-6 backdrop-blur-md"
            onClick={() => setOpen(null)}
          >
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg border border-gea-cream/15 bg-gea-black p-10"
            >
              <button
                type="button"
                onClick={() => setOpen(null)}
                aria-label="Fechar"
                className="absolute right-5 top-5 text-gea-cream/50 transition hover:text-gea-cream"
              >
                ✕
              </button>
              <span className="text-[0.6rem] uppercase tracking-[0.5em] text-gea-sunset/80">
                Benefício GEA
              </span>
              <h3 className="mt-5 font-display text-3xl italic leading-tight text-gea-cream">
                {open.title}
              </h3>
              <p className="mt-6 text-sm leading-relaxed text-gea-cream/70">
                {open.detail}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
                <a
                  href="https://instagram.com/geastoree"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-3 border border-gea-cream/30 px-6 py-3 text-[0.65rem] uppercase tracking-[0.36em] text-gea-cream transition-colors duration-500 hover:bg-gea-cream hover:text-gea-black"
                >
                  Seguir @geastoree <span>→</span>
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(null)}
                  className="plausible-event-name=Benefit+Back inline-flex items-center justify-center gap-2 px-4 py-3 text-[0.6rem] uppercase tracking-[0.4em] text-gea-cream/55 transition-colors duration-500 hover:text-gea-cream"
                >
                  <span>←</span> Voltar aos cards
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
