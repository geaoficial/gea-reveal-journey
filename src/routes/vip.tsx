import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CONTACT_LINKS } from "@/lib/contact";

// Links oficiais — edite aqui se mudarem.
const INSTAGRAM_URL = "https://instagram.com/geastoree";
const VIP_GROUP_URL = CONTACT_LINKS.whatsapp; // grupo VIP (WhatsApp)
const SHARE_URL = "https://geastore.lovable.app";
const STORAGE_KEY = "gea_vip_progress_v1";

type Progress = { instagram: boolean; group: boolean; share: boolean };
const EMPTY: Progress = { instagram: false, group: false, share: false };

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "GEA VIP — Comunidade exclusiva" },
      {
        name: "description",
        content:
          "Toda grande jornada começa antes da primeira conquista. Bem-vindo à GEA VIP.",
      },
      { property: "og:title", content: "GEA VIP" },
      {
        property: "og:description",
        content: "Comunidade exclusiva GEA — siga, participe e compartilhe.",
      },
    ],
  }),
  component: VipPage,
});

function VipPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [shareToast, setShareToast] = useState<string | null>(null);

  // Hidrata do localStorage (client-only para evitar mismatch de SSR)
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

  const done = progress.instagram && progress.group && progress.share;
  const count = Number(progress.instagram) + Number(progress.group) + Number(progress.share);
  const pct = (count / 3) * 100;

  function handleInstagram() {
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
    mark("instagram");
  }

  function handleGroup() {
    window.open(VIP_GROUP_URL, "_blank", "noopener,noreferrer");
    mark("group");
  }

  async function handleShare() {
    const data = {
      title: "GEA",
      text: "Conheça a GEA — uma nova experiência premium.",
      url: SHARE_URL,
    };
    try {
      if (typeof navigator !== "undefined" && "share" in navigator) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(SHARE_URL);
        setShareToast("Link copiado para a área de transferência.");
      }
      mark("share");
      setTimeout(() => setShareToast(null), 3200);
    } catch {
      // Usuário cancelou o share — não marca.
    }
  }

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
        <Link to="/" className="text-xs uppercase tracking-[0.5em]">
          GEA
        </Link>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">VIP</span>
        <span className="w-8" />
      </header>

      <main className="mx-auto max-w-lg px-6 pb-24 pt-16 sm:pt-24">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
          Bem-vindo
        </p>
        <h1 className="mt-6 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
          Toda grande jornada começa antes da primeira conquista.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-white/60">
          Bem-vindo à <span className="text-white">GEA VIP</span>.
        </p>

        {/* Progresso */}
        <div className="mt-10">
          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-white/40">
            <span>Progresso</span>
            <span>{count}/3</span>
          </div>
          <div className="mt-3 h-[2px] w-full overflow-hidden bg-white/[0.08]">
            <div
              className="h-full bg-white transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
          <ul className="mt-5 space-y-2 text-xs text-white/60">
            <ProgressItem done={progress.instagram} label="Seguir Instagram" />
            <ProgressItem done={progress.group} label="Entrar no Grupo VIP" />
            <ProgressItem done={progress.share} label="Compartilhar a GEA" />
          </ul>
        </div>

        {/* Ações */}
        <div className="mt-10 space-y-3">
          <ActionButton
            done={progress.instagram}
            onClick={handleInstagram}
            label="Seguir a GEA no Instagram"
            doneLabel="Seguindo no Instagram"
          />
          <ActionButton
            done={progress.group}
            onClick={handleGroup}
            label="Entrar no Grupo VIP"
            doneLabel="No Grupo VIP"
          />
          <ActionButton
            done={progress.share}
            onClick={handleShare}
            label="Compartilhar a GEA"
            doneLabel="GEA compartilhada"
          />
        </div>

        {/* Mensagem de recompensa por compartilhar */}
        {progress.share && !done && (
          <p className="mt-6 text-xs leading-relaxed text-white/60">
            Você desbloqueou novos benefícios exclusivos.
          </p>
        )}

        {shareToast && (
          <p className="mt-4 text-[11px] uppercase tracking-[0.3em] text-white/50">
            {shareToast}
          </p>
        )}

        {/* Estado final */}
        {done && (
          <div className="mt-12 border-t border-white/[0.08] pt-10">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
              Comunidade GEA
            </p>
            <h2 className="mt-4 text-2xl font-light tracking-tight sm:text-3xl">
              Parabéns.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              Agora você faz parte da comunidade GEA.
            </p>
            <Link
              to="/"
              className="mt-8 inline-flex items-center justify-center border border-white/20 px-6 py-3 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black"
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
          <svg viewBox="0 0 10 10" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.6">
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
      className={`group flex w-full items-center justify-between border px-5 py-4 text-left text-sm transition ${
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
