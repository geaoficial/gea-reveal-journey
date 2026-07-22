import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

// Links oficiais — edite aqui se mudarem.
const INSTAGRAM_URL = "https://instagram.com/geastoree";
const BASE_URL = "https://geastore.online";
const STORAGE_KEY = "gea_vip_progress_v3";
const REF_KEY = "gea_vip_ref_id";
const FRIENDS_KEY = "gea_vip_friends_confirmed";
const INVITED_BY_KEY = "gea_vip_invited_by";
const INVITE_CREDITED_KEY = "gea_vip_invite_credited"; // marca que este dispositivo já creditou seu convidador
const CREDIT_QUEUE_PREFIX = "gea_vip_credit_queue_";   // fila local de convidados concluídos, por código do convidador
const CONSUMED_CREDITS_KEY = "gea_vip_consumed_credits"; // guestIds já contabilizados pelo convidador neste dispositivo
const COUPON_MAIN = "GEA10";
const COUPON_EXTRA = "GEA26";
const MEMBER_KEY = "gea_vip_member_v1";

type Progress = { instagram: boolean; share: boolean };
const EMPTY: Progress = { instagram: false, share: false };

type Member = { name: string; whatsapp: string; registeredAt: string };

// Aceita apenas letras (com acentos), espaços, hífen e apóstrofo.
const NAME_RE = /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/;

function sanitizeName(v: string) {
  return v.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ' -]/g, "").replace(/\s{2,}/g, " ").slice(0, 60);
}

/** Formata número brasileiro conforme digita: (11) 91234-5678 ou (11) 1234-5678. */
function formatWhatsapp(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Valida DDD BR (11–99) e comprimento 10 (fixo) ou 11 (celular, começando por 9). */
function isValidWhatsapp(v: string) {
  const d = v.replace(/\D/g, "");
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (ddd < 11 || ddd > 99) return false;
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}


/**
 * Registra que ESTE dispositivo (convidado) concluiu todas as etapas da GEA VIP
 * e credita 1 amigo confirmado ao convidador `inviterCode`.
 *
 * Regras:
 * - Só é chamada uma única vez por dispositivo (INVITE_CREDITED_KEY).
 * - Ignora auto-convite (convidador === próprio refId).
 * - Enfileira o guestId em `gea_vip_credit_queue_{inviterCode}` de forma idempotente,
 *   para que o convidador (mesmo dispositivo, em modo demo, ou o backend no futuro)
 *   contabilize somente uma vez por convite.
 *
 * Preparado para Supabase: substituir a fila local por
 *   fetch('/api/public/invite/complete', { method:'POST', body: JSON.stringify({ inviter, guest }) }).
 */
async function creditInviterOnCompletion(inviterCode: string, guestCode: string) {
  if (!inviterCode || !guestCode) return;
  if (inviterCode === guestCode) return; // auto-convite não vale
  try {
    if (localStorage.getItem(INVITE_CREDITED_KEY)) return; // este dispositivo já creditou
    const key = CREDIT_QUEUE_PREFIX + inviterCode;
    const raw = localStorage.getItem(key);
    const list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(guestCode)) {
      list.push(guestCode);
      localStorage.setItem(key, JSON.stringify(list));
    }
    localStorage.setItem(INVITE_CREDITED_KEY, inviterCode);
  } catch {
    // noop
  }
  // TODO(backend): POST /api/public/invite/complete { inviter: inviterCode, guest: guestCode }
}

/**
 * Consome créditos pendentes destinados ao convidador (refId deste dispositivo).
 * Retorna quantos NOVOS amigos foram creditados nesta chamada.
 * Idempotente por guestId (CONSUMED_CREDITS_KEY).
 */
function drainPendingCreditsFor(refId: string): number {
  if (!refId) return 0;
  try {
    const raw = localStorage.getItem(CREDIT_QUEUE_PREFIX + refId);
    if (!raw) return 0;
    const list: string[] = JSON.parse(raw);
    const consumedRaw = localStorage.getItem(CONSUMED_CREDITS_KEY);
    const consumed: string[] = consumedRaw ? JSON.parse(consumedRaw) : [];
    const fresh = list.filter((g) => !consumed.includes(g));
    if (fresh.length === 0) return 0;
    const nextConsumed = [...consumed, ...fresh];
    localStorage.setItem(CONSUMED_CREDITS_KEY, JSON.stringify(nextConsumed));
    return fresh.length;
  } catch {
    return 0;
  }
}

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
        content: "Faça parte da comunidade que acredita em evolução, propósito e exclusividade.",
      },
    ],
  }),
  component: VipPage,
});

function makeId() {
  return "GEA" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function VipPage() {
  const [progress, setProgress] = useState<Progress>(EMPTY);
  const [refId, setRefId] = useState<string>("");
  const [friends, setFriends] = useState<number>(0);
  const [copied, setCopied] = useState<null | "main" | "extra">(null);
  const [celebrate, setCelebrate] = useState(false);
  const [invitedBy, setInvitedBy] = useState<string>("");
  const [member, setMember] = useState<Member | null>(null);
  const [welcomeShown, setWelcomeShown] = useState(false);

  // Load persisted state.
  useEffect(() => {
    try {
      const rawMember = localStorage.getItem(MEMBER_KEY);
      if (rawMember) {
        const m = JSON.parse(rawMember) as Member;
        if (m?.name && m?.whatsapp) {
          setMember(m);
          setWelcomeShown(true);
        }
      }

      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setProgress({ ...EMPTY, ...JSON.parse(raw) });

      let id = localStorage.getItem(REF_KEY);
      if (!id) {
        id = makeId();
        localStorage.setItem(REF_KEY, id);
      }
      setRefId(id);

      // O contador de amigos é derivado exclusivamente da fila local de créditos
      // destinada a este refId. Nada de incremento por URL ou por ações do próprio dono.
      const stored = Number(localStorage.getItem(FRIENDS_KEY) || "0");
      const base = Number.isFinite(stored) ? stored : 0;
      const fresh = drainPendingCreditsFor(id);
      const total = base + fresh;
      if (fresh > 0) {
        localStorage.setItem(FRIENDS_KEY, String(total));
        setCelebrate(true);
      }
      setFriends(total);

      const inviter = localStorage.getItem(INVITED_BY_KEY) || "";
      // Ignora auto-convite (mesmo dispositivo). Não credita, não mostra banner.
      if (inviter && inviter !== id) setInvitedBy(inviter);
    } catch {
      // noop: localStorage pode estar indisponível no modo privado.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // noop
    }
  }, [progress]);

  const mark = (key: keyof Progress) => setProgress((p) => (p[key] ? p : { ...p, [key]: true }));

  const count = Number(progress.instagram) + Number(progress.share);
  const done = count === 2;
  const pct = (count / 2) * 100;

  const inviteLink = useMemo(
    () => (refId ? `${BASE_URL}/invite/${refId}` : BASE_URL),
    [refId],
  );

  // Ao concluir as duas etapas, credita o convidador (uma única vez).
  useEffect(() => {
    if (!done || !invitedBy || !refId) return;
    try {
      if (localStorage.getItem(INVITE_NOTIFIED_KEY)) return;
      localStorage.setItem(INVITE_NOTIFIED_KEY, invitedBy);
      // Fluxo de demonstração no mesmo dispositivo: se o convidador for este mesmo browser,
      // também incrementa o contador local. Em produção com backend, isso vem do servidor.
      if (invitedBy === refId) {
        const next = friends + 1;
        localStorage.setItem(FRIENDS_KEY, String(next));
        setFriends(next);
        setCelebrate(true);
      }
      void notifyInviteCompleted(invitedBy, refId);
    } catch {
      // noop
    }
  }, [done, invitedBy, refId, friends]);


  function handleInstagram() {
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
    mark("instagram");
  }

  async function handleShareInvite() {
    const sharedTitle = "GEA — Comunidade exclusiva";
    const sharedText =
      "Entre para a comunidade GEA. Experiência, estilo e benefícios exclusivos te esperam.";

    let shared = false;

    if (typeof navigator !== "undefined" && "share" in navigator) {
      try {
        await navigator.share({
          title: sharedTitle,
          text: sharedText,
          url: inviteLink,
        });
        shared = true;
        toast.success("Convite compartilhado com sucesso.", {
          description: "Obrigado por levar a GEA adiante.",
        });
      } catch (err) {
        // O usuário pode ter cancelado o compartilhamento nativo;
        // não tratamos como erro, tentamos copiar em seguida.
        if (err instanceof Error && err.name === "AbortError") {
          toast("Compartilhamento cancelado.", {
            description: "Você pode tentar novamente quando quiser.",
          });
          return;
        }
      }
    }

    if (!shared) {
      try {
        await navigator.clipboard.writeText(inviteLink);
        toast.success("Link de convite copiado.", {
          description: "Agora é só enviar para quem você quiser.",
        });
      } catch {
        toast.error("Não foi possível copiar automaticamente.", {
          description: "Selecione e copie o link manualmente.",
        });
      }
    }

    mark("share");
  }

  async function copyCoupon(code: string, which: "main" | "extra") {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(which);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // noop: clipboard pode ser negado pelo navegador.
    }
  }

  async function copyInvite() {
    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Link de convite copiado.", {
        description: "Agora é só enviar para quem você quiser.",
      });
    } catch {
      toast.error("Não foi possível copiar automaticamente.", {
        description: "Selecione e copie o link manualmente.",
      });
    }
  }

  const friendsPct = Math.min(100, friends * 100);
  const extraUnlocked = friends >= 1;

  function handleRegister(m: Member) {
    try {
      localStorage.setItem(MEMBER_KEY, JSON.stringify(m));
    } catch {
      // noop
    }
    setMember(m);
    setWelcomeShown(false);
    toast.success("Bem-vindo à Comunidade GEA.", {
      description: `${m.name.split(" ")[0]}, seu acesso está liberado.`,
    });
    // Pequena transição para a mensagem de boas-vindas.
    setTimeout(() => setWelcomeShown(true), 900);
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
        {invitedBy && (
          <div className="mb-8 flex items-center gap-3 border-l border-white/30 bg-white/[0.02] px-4 py-3 animate-fade-in">
            <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Convite</span>
            <p className="text-[12px] leading-relaxed text-white/70">
              Você foi convidado para fazer parte da comunidade GEA.
            </p>
          </div>
        )}

        {!member ? (
          <RegisterForm onSubmit={handleRegister} />
        ) : !welcomeShown ? (
          <WelcomeSplash name={member.name} />
        ) : (
        <>
        <div className="animate-fade-in">
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
            Olá, {member.name.split(" ")[0]}
          </p>
          <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Bem-vindo</p>
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
              <ProgressItem done={progress.instagram} label="Seguir a GEA no Instagram" />
              <ProgressItem done={progress.share} label="Compartilhar meu convite GEA" />
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
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Código</span>
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
              Convide um amigo para conhecer a GEA. Quando ele acessar através do seu link e
              concluir as mesmas etapas, você desbloqueará benefícios exclusivos.
            </p>

            <ul className="mt-6 space-y-2 text-xs text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-1 rounded-full bg-white/60" />
                Cupom especial <span className="text-white">GEA26</span> para a primeira compra.
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 h-1 w-1 rounded-full bg-white/60" />1 participação no sorteio
                de um brinde misterioso da GEA.
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
                {extraUnlocked ? "1 amigo confirmado." : "0 de 1 amigo confirmado."}
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
                <p className="text-[10px] uppercase tracking-[0.5em] text-white/50">Parabéns</p>
                <p className="mt-4 text-sm leading-relaxed text-white/80">
                  Seu amigo concluiu todas as etapas. Você desbloqueou o cupom{" "}
                  <span className="text-white">GEA26</span> e garantiu sua participação no sorteio
                  do <span className="text-white">Brinde Misterioso GEA</span>.
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
        </>
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

function RegisterForm({ onSubmit }: { onSubmit: (m: Member) => void }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [nameErr, setNameErr] = useState<string | null>(null);
  const [phoneErr, setPhoneErr] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function validate() {
    let ok = true;
    const trimmed = name.trim();
    if (!trimmed) {
      setNameErr("Informe seu nome.");
      ok = false;
    } else if (trimmed.length < 2 || !NAME_RE.test(trimmed)) {
      setNameErr("Use apenas letras.");
      ok = false;
    } else {
      setNameErr(null);
    }
    if (!isValidWhatsapp(phone)) {
      setPhoneErr("Informe um WhatsApp válido com DDD.");
      ok = false;
    } else {
      setPhoneErr(null);
    }
    return ok;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    onSubmit({
      name: name.trim().replace(/\s+/g, " "),
      whatsapp: phone.replace(/\D/g, ""),
      registeredAt: new Date().toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="animate-fade-in">
      <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Cadastro rápido</p>
      <h1 className="mt-6 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
        Entrar na GEA VIP.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/60">
        Dois campos e você está dentro. Nada de login ou senha.
      </p>

      <div className="mt-10 space-y-6">
        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">Nome</span>
          <input
            type="text"
            inputMode="text"
            autoComplete="name"
            autoCapitalize="words"
            spellCheck={false}
            maxLength={60}
            placeholder="Seu nome"
            value={name}
            onChange={(e) => {
              setName(sanitizeName(e.target.value));
              if (nameErr) setNameErr(null);
            }}
            className="mt-2 w-full border-b border-white/20 bg-transparent py-3 text-base text-white placeholder-white/25 outline-none transition focus:border-white"
          />
          {nameErr && <span className="mt-2 block text-[11px] text-red-300/90">{nameErr}</span>}
        </label>

        <label className="block">
          <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">WhatsApp</span>
          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel-national"
            maxLength={16}
            placeholder="(11) 91234-5678"
            value={phone}
            onChange={(e) => {
              setPhone(formatWhatsapp(e.target.value));
              if (phoneErr) setPhoneErr(null);
            }}
            className="mt-2 w-full border-b border-white/20 bg-transparent py-3 text-base text-white placeholder-white/25 outline-none transition focus:border-white"
          />
          {phoneErr && <span className="mt-2 block text-[11px] text-red-300/90">{phoneErr}</span>}
        </label>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-10 w-full border border-white/25 py-4 text-[11px] uppercase tracking-[0.4em] text-white transition hover:bg-white hover:text-black disabled:opacity-60"
      >
        {submitting ? "Entrando…" : "Entrar na GEA VIP"}
      </button>

      <p className="mt-6 text-[11px] leading-relaxed text-white/40">
        Ao entrar, você concorda em receber comunicações da GEA no WhatsApp.
      </p>
    </form>
  );
}

function WelcomeSplash({ name }: { name: string }) {
  const first = name.split(" ")[0];
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center text-center animate-fade-in">
      <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Comunidade GEA</p>
      <h1 className="mt-6 text-3xl font-light leading-tight tracking-tight sm:text-4xl">
        Bem-vindo à Comunidade GEA.
      </h1>
      <p className="mt-4 text-sm text-white/60">{first}, seu acesso está liberado.</p>
      <span className="mt-10 h-[2px] w-16 animate-pulse bg-white/40" />
    </div>
  );
}
