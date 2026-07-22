import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

// Links oficiais — edite aqui se mudarem.
const INSTAGRAM_URL = "https://instagram.com/geastoree";
const BASE_URL = "https://geastore.lovable.app";
const STORAGE_KEY = "gea_vip_progress_v3";
const REF_KEY = "gea_vip_ref_id";
const FRIENDS_KEY = "gea_vip_friends_confirmed";
const COUPON_MAIN = "GEA10";
const COUPON_EXTRA = "GEA26";

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

function makeId() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function VipPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [refId, setRefId] = useState<string>("");
  const [friends, setFriends] = useState<number>(0);
  const [toast, setToast] = useState<string | null>(null);
  const [copied, setCopied] = useState<null | "main" | "extra">(null);
  const [celebrate, setCelebrate] = useState(false);

  // Load persisted state.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });

      let id = localStorage.getItem(REF_KEY);
      if (!id) {
        id = makeId();
        localStorage.setItem(REF_KEY, id);
      }
      setRefId(id);

      const f = Number(localStorage.getItem(FRIENDS_KEY) || "0");
      setFriends(Number.isFinite(f) ? f : 0);

      // Confirmação via URL: /vip?confirm=REFID
      const url = new URL(window.location.href);
      const confirm = url.searchParams.get("confirm");
      if (confirm && confirm === id) {
        const already = localStorage.getItem("gea_vip_confirm_" + confirm);
        if (!already) {
          const next = (Number.isFinite(f) ? f : 0) + 1;
          localStorage.setItem(FRIENDS_KEY, String(next));
          localStorage.setItem("gea_vip_confirm_" + confirm, "1");
          setFriends(next);
          if (next >= 1) setCelebrate(true);
        }
        url.searchParams.delete("confirm");
        window.history.replaceState({}, "", url.pathname + url.search);
      }
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

  const inviteLink = useMemo(
    () => (refId ? `${BASE_URL}/vip?ref=${refId}` : BASE_URL),
    [refId],
  );

  function handleInstagram() {
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
    mark("instagram");
  }

  async function handleShareInvite() {
    const sharedTitle = "GEA — Comunidade exclusiva";
    const sharedText = "Entre para a comunidade GEA. Experiência, estilo e benefícios exclusivos te esperam.";

    let shared = false;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: sharedTitle,
          text: sharedText,
          url: inviteLink,
        });
        shared = true;
        setToast("Convite compartilhado com sucesso.");
      } catch (err) {
        // O usuário pode ter cancelado o compartilhamento nativo;
        // não tratamos como erro, tentamos copiar em seguida.
        if (err instanceof Error && err.name === "AbortError") {
          setToast("Compartilhamento cancelado.");
          setTimeout(() => setToast(null), 2200);
          return;
        }
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        setToast("Link de convite copiado para a área de transferência.");
      } catch {
        setToast("Não foi possível copiar automaticamente. Selecione e copie o link abaixo.");
      }
    }

    mark("share");
    setTimeout(() => setToast(null), 3000);
  }


  async function copyCoupon(code: string, which: "main" | "extra") {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {}
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      setToast("Link copiado.");
      setTimeout(() => setToast(null), 2800);
    } catch {}
  }

  const friendsPct = Math.min(100, friends * 100);
  const extraUnlocked = friends >= 1;

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
        <div className="animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
            Bem-vindo
          </p>
          <h1 className="mt-6 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
            Bem-vindo à GEA.
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Complete duas ações e desbloqueie seu cupom exclusivo.
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
                label="Compartilhar meu convite GEA"
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
              onClick={handleShareInvite}
              label="Compartilhar meu convite GEA"
              doneLabel="Convite compartilhado"
            />
          </div>

          {toast && (
            <div className="mt-6 flex animate-fade-in items-center gap-3 border border-white/15 bg-white/[0.04] px-4 py-3">
              <span className="flex h-5 w-5 items-center justify-center rounded-full border border-white/40">
                <svg
                  viewBox="0 0 12 12"
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M2 6.5 4.5 9 10 3" />
                </svg>
              </span>
              <p className="text-[11px] uppercase tracking-[0.25em] text-white/70">
                {toast}
              </p>
            </div>
          )}
        </div>

        {/* Cupom desbloqueado */}
        {done && (
          <section className="mt-16 animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
              Cupom desbloqueado
            </p>
            <h2 className="mt-4 text-2xl font-light tracking-tight sm:text-3xl">
              Seu desconto já está garantido.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              10% de desconto na sua primeira compra.
            </p>

            <div className="mt-6 border border-white/20 bg-white/[0.03] p-6">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                  Código
                </span>
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                  10% OFF
                </span>
              </div>
              <div className="mt-4 text-2xl font-light tracking-[0.35em] sm:text-3xl">
                {COUPON_MAIN}
              </div>
              <button
                type="button"
                onClick={() => copyCoupon(COUPON_MAIN, "main")}
                className="mt-6 w-full border border-white/25 py-3.5 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black"
              >
                {copied === "main" ? "Cupom copiado" : "Copiar Cupom"}
              </button>
            </div>
          </section>
        )}

        {/* Benefícios extras */}
        {done && (
          <section className="mt-16 animate-fade-in">
            <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
              Desbloqueie benefícios extras
            </p>
            <h2 className="mt-4 text-2xl font-light tracking-tight sm:text-3xl">
              Convide um amigo.
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/60">
              Convide um amigo para conhecer a GEA. Quando ele acessar através
              do seu link e concluir as mesmas etapas, você desbloqueará
              benefícios exclusivos.
            </p>

            <ul className="mt-6 space-y-2 text-xs text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-1 rounded-full bg-white/60" />
                Cupom especial <span className="text-white">GEA26</span> para a
                primeira compra.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-1 rounded-full bg-white/60" />1
                participação no sorteio de um brinde misterioso da GEA.
              </li>
            </ul>

            {/* Barra amigo */}
            <div className="mt-8">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.4em] text-white/40">
                <span>Amigos confirmados</span>
                <span>{Math.min(friends, 1)}/1</span>
              </div>
              <div className="mt-3 h-[2px] w-full overflow-hidden bg-white/[0.08]">
                <div
                  className="h-full bg-white transition-all duration-700 ease-out"
                  style={{ width: `${friendsPct}%` }}
                />
              </div>
              <p className="mt-3 text-[11px] text-white/50">
                {extraUnlocked
                  ? "1 amigo confirmado."
                  : "0 de 1 amigo confirmado."}
              </p>
            </div>

            {/* Link de convite */}
            <div className="mt-6 flex items-center gap-2 border border-white/15 bg-white/[0.02] px-4 py-3">
              <span className="min-w-0 flex-1 truncate text-[12px] text-white/70">
                {inviteLink}
              </span>
              <button
                type="button"
                onClick={copyInvite}
                className="shrink-0 border border-white/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:border-white/50 hover:text-white"
              >
                Copiar
              </button>
            </div>

            {/* Cupom extra */}
            {extraUnlocked && (
              <div
                className={`mt-10 border border-white/25 bg-white/[0.04] p-6 animate-fade-in ${
                  celebrate ? "animate-scale-in" : ""
                }`}
              >
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/50">
                  Parabéns
                </p>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  Seu amigo concluiu todas as etapas. Você desbloqueou o cupom{" "}
                  <span className="text-white">GEA26</span> e garantiu sua
                  participação no sorteio do{" "}
                  <span className="text-white">Brinde Misterioso GEA</span>.
                </p>
                <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-6">
                  <span className="text-2xl font-light tracking-[0.35em] sm:text-3xl">
                    {COUPON_EXTRA}
                  </span>
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
                    Brinde + Cupom
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => copyCoupon(COUPON_EXTRA, "extra")}
                  className="mt-6 w-full border border-white/25 py-3.5 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black"
                >
                  {copied === "extra" ? "Cupom copiado" : "Copiar GEA26"}
                </button>
              </div>
            )}

            <a
              href="https://geastore.online/"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-12 inline-flex items-center justify-center border border-white/25 px-7 py-3.5 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black"
            >
              Explorar Benefícios
            </a>
          </section>
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
      disabled={done}
      aria-disabled={done}
      className={`flex w-full items-center justify-between border px-5 py-4 text-left text-sm transition ${
        done
          ? "border-white/20 bg-white/[0.04] text-white/60 cursor-default"
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
