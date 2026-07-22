import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

// Links oficiais — edite aqui se mudarem.
const INSTAGRAM_URL = "https://instagram.com/geastoree";
const SHARE_URL = "https://geastore.lovable.app";
const STORAGE_KEY = "gea_vip_progress_v2";

type Progress = { instagram: boolean; share: boolean };
const EMPTY: Progress = { instagram: false, share: false };

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "GEA VIP — Comunidade exclusiva" },
      {
        name: "description",
        content:
          "Bem-vindo à GEA. Faça parte da comunidade que acredita em evolução, propósito e exclusividade.",
      },
      { property: "og:title", content: "GEA VIP" },
      {
        property: "og:description",
        content:
          "Faça parte da comunidade que acredita em evolução, propósito e exclusividade.",
      },
    ],
  }),
  component: VipPage,
});

function VipPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {}
  }, [progress]);

  const mark = (key: keyof Progress) =>
    setProgress((p) => (p[key] ? p : { ...p, [key]: true }));

  const count = Number(progress.instagram) + Number(progress.share);
  const done = count === 2;
  const pct = (count / 2) * 100;

  function handleInstagram() {
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
    mark("instagram");
  }

  async function handleShare() {
    const data = {
      title: "GEA",
      text: "Conheça a GEA — uma nova experiência premium.",
      url: SHARE_URL,
    };
    try {
      const nav = navigator as Navigator & {
        share?: (d: ShareData) => Promise<void>;
        clipboard?: { writeText: (t: string) => Promise<void> };
      };
      if (typeof nav.share === "function") {
        await nav.share(data);
      } else if (nav.clipboard?.writeText) {
        await nav.clipboard.writeText(SHARE_URL);
        setToast("Link copiado. Compartilhe com um amigo.");
      }
      mark("share");
      setTimeout(() => setToast(null), 3600);
    } catch {
      // usuário cancelou — não marca
    }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
        <Link to="/" className="text-xs uppercase tracking-[0.5em]">
          GEA
        </Link>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          VIP
        </span>
        <span className="w-8" />
      </header>

      <main className="mx-auto max-w-lg px-6 pb-24 pt-16 sm:pt-24">
        {!done ? (
          <div className="animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
              Bem-vindo
            </p>
            <h1 className="mt-6 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
              Bem-vindo à GEA.
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Faça parte da comunidade que acredita em evolução, propósito e
              exclusividade.
            </p>

            {/* Progresso */}
            <div className="mt-10">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-white/40">
                <span>Progresso</span>
                <span>{count}/2</span>
              </div>
              <div className="mt-3 h-[2px] w-full overflow-hidden bg-white/[0.08]">
                <div
                  className="h-full bg-white transition-all duration-700 ease-out"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <ul className="mt-5 space-y-2 text-xs text-white/60">
                <ProgressItem
                  done={progress.instagram}
                  label="Seguir a GEA no Instagram"
                />
                <ProgressItem
                  done={progress.share}
                  label="Compartilhar a GEA com um amigo"
                />
              </ul>
            </div>

            {/* Ações */}
            <div className="mt-10 space-y-3">
              <ActionButton
                done={progress.instagram}
                onClick={handleInstagram}
                label="Seguir no Instagram"
                doneLabel="Seguindo no Instagram"
              />
              <ActionButton
                done={progress.share}
                onClick={handleShare}
                label="Compartilhar a GEA"
                doneLabel="GEA compartilhada"
              />
            </div>

            {toast && (
              <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-white/60 animate-fade-in">
                {toast}
              </p>
            )}
          </div>
        ) : (
          <div className="animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
              Comunidade GEA
            </p>
            <h2 className="mt-6 text-3xl font-light tracking-tight sm:text-4xl">
              Parabéns.
            </h2>
            <div className="mt-6 space-y-4 text-sm leading-relaxed text-white/70">
              <p>
                Você acaba de dar o primeiro passo para fazer parte da nossa
                comunidade.
              </p>
              <p>
                A GEA não é apenas uma marca. É uma comunidade construída por
                pessoas que escolhem viver com propósito, elegância e evolução
                constante.
              </p>
              <p>
                A partir de agora, você terá acesso antecipado a lançamentos,
                benefícios exclusivos, campanhas especiais e novidades
                reservadas apenas para membros da comunidade GEA.
              </p>
              <p>Obrigado por fazer parte deste início.</p>
              <p className="text-white">O melhor ainda está por vir.</p>
            </div>

            <Link
              to="/"
              className="mt-10 inline-flex items-center justify-center border border-white/25 px-7 py-3.5 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black"
            >
              Explorar Benefícios
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function ProgressItem({ done, label }: { done: boolean; label: string }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`inline-flex h-4 w-4 items-center justify-center border transition ${
          done ? "border-white bg-white text-black" : "border-white/25"
        }`}
        aria-hidden
      >
        {done ? (
          <svg
            viewBox="0 0 10 10"
            className="h-2.5 w-2.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          >
            <path d="M1.5 5.2 4 7.5 8.5 2.5" />
          </svg>
        ) : null}
      </span>
      <span className={done ? "text-white" : ""}>{label}</span>
    </li>
  );
}

function ActionButton({
  done,
  onClick,
  label,
  doneLabel,
}: {
  done: boolean;
  onClick: () => void;
  label: string;
  doneLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center justify-between border px-5 py-4 text-left text-sm transition ${
        done
          ? "border-white/20 bg-white/[0.04] text-white/80"
          : "border-white/25 text-white hover:bg-white hover:text-black"
      }`}
    >
      <span className="tracking-wide">{done ? doneLabel : label}</span>
      <span className="text-[10px] uppercase tracking-[0.4em] opacity-60">
        {done ? "Concluído" : "Abrir"}
      </span>
    </button>
  );
}
