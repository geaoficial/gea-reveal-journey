import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import {
  getMyVipMember,
  registerVipMember,
  loginVipMember,
  logoutVipMember,
  confirmInstagramFollow,
  logInviteShare,
} from "@/lib/vip-agent.functions";
import { VipCard } from "@/components/gea/VipCard";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "Clube VIP — GEA" },
      {
        name: "description",
        content: "Área exclusiva dos primeiros membros da GEA. Cartão digital, benefícios e convites.",
      },
      { property: "og:title", content: "Clube VIP — GEA" },
      { property: "og:description", content: "Torne-se um dos Primeiros da GEA." },
    ],
  }),
  component: VipPage,
});

function VipPage() {
  const getMe = useServerFn(getMyVipMember);
  const me = useQuery({ queryKey: ["vip", "me"], queryFn: () => getMe() });

  if (me.isLoading) {
    return (
      <div className="min-h-screen bg-black text-white/60 flex items-center justify-center">
        <div className="animate-pulse text-xs uppercase tracking-[0.4em]">Carregando…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="px-6 py-6 flex items-center justify-between border-b border-white/[0.06]">
        <Link to="/" className="text-xs uppercase tracking-[0.5em]">
          GEA
        </Link>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          Clube VIP
        </span>
      </header>

      {me.data?.ok ? <MemberPanel data={me.data} /> : <VisitorPanel />}
    </div>
  );
}

// ------------------------------------------------------------------
function VisitorPanel() {
  const [mode, setMode] = useState<"register" | "login">("register");
  return (
    <div className="mx-auto max-w-xl px-6 py-16">
      <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Ato final</p>
      <h1 className="mt-3 text-3xl md:text-4xl font-light leading-tight">
        Torne-se um dos <em className="not-italic font-normal">Primeiros da GEA</em>.
      </h1>
      <p className="mt-4 text-sm text-white/60 leading-relaxed">
        Cartão digital vitalício, acesso antecipado ao drop e benefícios exclusivos entregues
        conforme você constrói o círculo. Cadastro único.
      </p>

      <div className="mt-10 flex gap-6 text-[11px] uppercase tracking-[0.35em]">
        <button
          onClick={() => setMode("register")}
          className={mode === "register" ? "text-white" : "text-white/40"}
        >
          Novo membro
        </button>
        <button
          onClick={() => setMode("login")}
          className={mode === "login" ? "text-white" : "text-white/40"}
        >
          Já sou membro
        </button>
      </div>

      <div className="mt-8">{mode === "register" ? <RegistrationForm /> : <LoginForm />}</div>
    </div>
  );
}

function RegistrationForm() {
  const register = useServerFn(registerVipMember);
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [instagram, setInstagram] = useState("");
  const [city, setCity] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [issued, setIssued] = useState<{ memberNumber: number; accessCode: string } | null>(null);

  const mutation = useMutation({
    mutationFn: (data: {
      fullName: string;
      instagram: string;
      city: string | undefined;
      acceptedTerms: true;
    }) => register({ data }),
    onSuccess: (res) => {
      if (res.ok) {
        setIssued({ memberNumber: res.member.memberNumber, accessCode: res.member.accessCode });
        qc.invalidateQueries({ queryKey: ["vip", "me"] });
      }
    },
  });

  if (issued) {
    return (
      <div className="rounded border border-amber-400/30 bg-amber-400/[0.04] p-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80">
          Cadastro confirmado
        </p>
        <h2 className="mt-3 text-2xl font-light">
          Membro Nº {String(issued.memberNumber).padStart(4, "0")}
        </h2>
        <p className="mt-3 text-sm text-white/60">
          Anote seu <strong className="text-white">código de acesso</strong> — ele permite entrar
          em qualquer aparelho:
        </p>
        <div className="mt-3 font-mono text-2xl tracking-[0.4em] text-white">{issued.accessCode}</div>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 w-full rounded bg-white text-black py-2.5 text-xs uppercase tracking-[0.3em]"
        >
          Ver meu cartão
        </button>
      </div>
    );
  }

  const res = mutation.data;
  const errMsg = res && !res.ok ? res.message : mutation.error ? "Erro inesperado." : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!accepted) return;
        mutation.mutate({
          fullName,
          instagram,
          city: city || undefined,
          acceptedTerms: true,
        });
      }}
      className="space-y-4"
    >
      <Field label="Nome completo">
        <input
          required
          minLength={2}
          maxLength={80}
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="input"
        />
      </Field>
      <Field label="Instagram (@)">
        <input
          required
          value={instagram}
          onChange={(e) => setInstagram(e.target.value.replace(/^@+/, ""))}
          placeholder="seuuser"
          className="input"
        />
      </Field>
      <Field label="Cidade (opcional)">
        <input
          maxLength={80}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="input"
        />
      </Field>

      <label className="flex items-start gap-3 text-xs text-white/60 pt-2">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 accent-white"
        />
        <span>
          Aceito receber comunicações da GEA e concordo com o regulamento do clube.
        </span>
      </label>

      {errMsg && <p className="text-sm text-red-400">{errMsg}</p>}

      <button
        disabled={!accepted || mutation.isPending}
        className="w-full rounded bg-white text-black py-3 text-xs uppercase tracking-[0.35em] disabled:opacity-30"
      >
        {mutation.isPending ? "Emitindo cartão…" : "Emitir meu cartão"}
      </button>

      <style>{`.input{margin-top:.5rem;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:.25rem;padding:.55rem .75rem;color:white;outline:none;transition:border-color .2s}.input:focus{border-color:rgba(255,255,255,.4)}`}</style>
    </form>
  );
}

function LoginForm() {
  const login = useServerFn(loginVipMember);
  const qc = useQueryClient();
  const [instagram, setInstagram] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { instagram: string; accessCode: string }) => login({ data }),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: ["vip", "me"] });
    },
  });

  const res = mutation.data;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate({ instagram, accessCode });
      }}
      className="space-y-4"
    >
      <Field label="Instagram (@)">
        <input
          required
          value={instagram}
          onChange={(e) => setInstagram(e.target.value.replace(/^@+/, ""))}
          className="input"
        />
      </Field>
      <Field label="Código de acesso">
        <input
          required
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
          className="input font-mono tracking-[0.3em]"
        />
      </Field>
      {res && !res.ok && <p className="text-sm text-red-400">{res.message}</p>}
      <button
        disabled={mutation.isPending}
        className="w-full rounded bg-white text-black py-3 text-xs uppercase tracking-[0.35em] disabled:opacity-30"
      >
        {mutation.isPending ? "…" : "Entrar"}
      </button>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">{label}</span>
      {children}
    </label>
  );
}

// ------------------------------------------------------------------
function MemberPanel({
  data,
}: {
  data: Extract<Awaited<ReturnType<typeof getMyVipMember>>, { ok: true }>;
}) {
  const navigate = useNavigate();
  const logout = useServerFn(logoutVipMember);
  const confirmFollow = useServerFn(confirmInstagramFollow);
  const qc = useQueryClient();
  const { member, invites, benefits, allBenefits, instagramFollowedAt, inviteSharedAt, cardUnlocked } = data;
  // Cartão só desbloqueia com AMBAS as ações: seguir + compartilhar.
  const highlightedBenefit = cardUnlocked
    ? (allBenefits.find((b) => b.unlocked && b.type === "welcome") ??
       allBenefits.find((b) => b.unlocked) ??
       null)
    : null;
  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/invite/${member.memberNumber}`
      : "";

  const pendingRef = useRef(false);
  const clickedAtRef = useRef<number | null>(null);
  const prevUnlockedRef = useRef(cardUnlocked);
  const [justUnlocked, setJustUnlocked] = useState(false);

  // Dispara flip do cartão no instante em que ambas as condições ficam verdadeiras.
  useEffect(() => {
    if (cardUnlocked && !prevUnlockedRef.current) {
      setJustUnlocked(true);
      try {
        (window as unknown as { plausible?: (n: string, o?: { props?: Record<string, unknown> }) => void })
          .plausible?.("Vip Card Unlocked", { props: { memberId: member.id } });
      } catch { /* ignore */ }
    }
    prevUnlockedRef.current = cardUnlocked;
  }, [cardUnlocked, member.id]);

  function track(name: string, props?: Record<string, string | number | boolean>) {
    try {
      (window as unknown as {
        plausible?: (n: string, o?: { props?: Record<string, unknown> }) => void;
      }).plausible?.(name, props ? { props } : undefined);
    } catch { /* ignore */ }
  }

  const followed = Boolean(instagramFollowedAt);
  const shared = Boolean(inviteSharedAt);

  // Impressão do CTA (uma vez por sessão de painel, quando ainda não seguiu)
  useEffect(() => {
    if (!followed) track("Vip Follow CTA View", { memberId: member.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    function onVisible() {
      if (document.visibilityState !== "visible" || !pendingRef.current) return;
      pendingRef.current = false;
      const startedAt = clickedAtRef.current;
      const elapsedMs = startedAt ? Date.now() - startedAt : 0;
      confirmFollow().then((r) => {
        if (r.ok) {
          if (!r.already) {
            track("Vip Follow Confirmed", { memberId: member.id, elapsedMs });
          } else {
            track("Vip Follow Reconfirmed", { memberId: member.id });
          }
          qc.invalidateQueries({ queryKey: ["vip", "me"] });
        } else {
          track("Vip Follow Confirm Failed", { memberId: member.id });
        }
      });
    }
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible);
    };
  }, [confirmFollow, qc, member.id]);

  function openInstagram() {
    pendingRef.current = true;
    clickedAtRef.current = Date.now();
    track("Vip Follow CTA Click", {
      memberId: member.id,
      alreadyFollowed: followed,
    });
    // Mantém evento genérico para compatibilidade com dashboards antigos
    track("Follow Instagram");
    window.open("https://instagram.com/geastoree", "_blank", "noopener,noreferrer");
  }


  return (
    <div className="mx-auto max-w-2xl px-6 py-12 space-y-10">
      <section className="relative">
        <div className="flex items-center justify-between mb-6">
          <p className="text-[10px] uppercase tracking-[0.5em] text-amber-300/70">
            Cartão do Membro
          </p>
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] uppercase tracking-[0.3em] ${
              member.status === "active"
                ? "border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300"
                : "border-white/20 bg-white/5 text-white/50"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                member.status === "active" ? "bg-emerald-400" : "bg-white/40"
              }`}
            />
            {member.status === "active" ? "Ativo" : member.status}
          </span>
        </div>

        <div className="flex justify-center">
          <VipCard
            name={member.fullName}
            memberId={String(member.memberNumber).padStart(4, "0")}
            unlockedAt={member.unlockedAt}
            benefit={highlightedBenefit}
            revealBack={justUnlocked || cardUnlocked}
          />
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          {cardUnlocked ? (
            <div>
              <div className="text-[10px] uppercase tracking-[0.35em] text-emerald-300/80">
                {justUnlocked ? "Cartão desbloqueado" : "Círculo completo"}
              </div>
              <p className="mt-2 text-xs text-white/50">
                Você seguiu @geastoree e compartilhou seu convite. Vire o cartão para ver seu cupom.
              </p>
            </div>
          ) : (
            <>
              <p className="text-[10px] uppercase tracking-[0.35em] text-amber-300/70">
                Desbloqueio do cartão · 2 passos
              </p>
              <ol className="mt-4 space-y-3">
                <li className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                          followed
                            ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                            : "border-white/25 text-white/50"
                        }`}
                      >
                        {followed ? "✓" : "1"}
                      </span>
                      <span className={followed ? "text-white/60 line-through" : "text-white"}>
                        Siga @geastoree no Instagram
                      </span>
                    </div>
                    {followed && instagramFollowedAt && (
                      <div className="mt-1 pl-7 text-[10px] uppercase tracking-[0.3em] text-white/40">
                        Confirmado em {new Date(instagramFollowedAt).toLocaleDateString("pt-BR")}
                      </div>
                    )}
                  </div>
                  {!followed && (
                    <button
                      onClick={openInstagram}
                      className="shrink-0 rounded bg-white px-4 py-2 text-[10px] uppercase tracking-[0.3em] text-black hover:bg-white/90"
                    >
                      Seguir
                    </button>
                  )}
                </li>
                <li className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span
                        className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                          shared
                            ? "border-emerald-400/50 bg-emerald-400/20 text-emerald-300"
                            : "border-white/25 text-white/50"
                        }`}
                      >
                        {shared ? "✓" : "2"}
                      </span>
                      <span className={shared ? "text-white/60 line-through" : "text-white"}>
                        Compartilhe seu convite pessoal
                      </span>
                    </div>
                    <div className="mt-1 pl-7 text-[10px] uppercase tracking-[0.3em] text-white/40">
                      {shared
                        ? `Compartilhado em ${new Date(inviteSharedAt!).toLocaleDateString("pt-BR")}`
                        : "Use um dos botões de compartilhamento abaixo"}
                    </div>
                  </div>
                </li>
              </ol>
              <p className="mt-4 text-[11px] text-white/40">
                Ao concluir as duas ações seu cartão vira automaticamente e revela o cupom exclusivo.
              </p>
            </>
          )}
        </div>
      </section>





      <section>
        <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          Seu círculo
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <Stat n={invites.confirmed} label="Confirmados" />
          <Stat n={invites.pending} label="Aguardando" />
          <Stat n={invites.total} label="Total" />
        </div>
        {inviteUrl && (
          <div className="mt-4 rounded border border-white/10 bg-white/[0.03] p-4">
            <p className="text-[10px] uppercase tracking-[0.35em] text-white/40">
              Seu link de convite
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input readOnly value={inviteUrl} className="flex-1 min-w-0 bg-transparent text-sm" />
              <CopyInviteButton url={inviteUrl} onShared={() => qc.invalidateQueries({ queryKey: ["vip", "me"] })} />
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `Você foi convidado para o Clube GEA. Acesse: ${inviteUrl}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  try {
                    (window as unknown as { plausible?: (n: string) => void }).plausible?.(
                      "Share Invite WhatsApp"
                    );
                  } catch { /* ignore */ }
                  logInviteShare({ data: { channel: "whatsapp" } })
                    .then(() => qc.invalidateQueries({ queryKey: ["vip", "me"] }))
                    .catch(() => { /* ignore */ });
                }}
                className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 border border-emerald-400/40 bg-emerald-400/[0.08] text-emerald-300 rounded hover:bg-emerald-400/[0.14]"
              >
                WhatsApp
              </a>
              <InviteQrButton url={inviteUrl} memberNumber={member.memberNumber} onShared={() => qc.invalidateQueries({ queryKey: ["vip", "me"] })} />
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          Benefícios disponíveis
        </h3>
        {benefits.length === 0 ? (
          <p className="mt-3 text-sm text-white/50">
            Continue convidando para desbloquear vantagens.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {benefits.map((b) => (
              <li
                key={b.id}
                className="rounded border border-amber-400/20 bg-amber-400/[0.03] p-4"
              >
                <div className="text-sm">{b.title}</div>
                {b.description && (
                  <p className="mt-1 text-xs text-white/50">{b.description}</p>
                )}
                {b.code && (
                  <div className="mt-2 font-mono text-amber-300 tracking-[0.3em] text-sm">
                    {b.code}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <button
        onClick={async () => {
          await logout();
          qc.invalidateQueries({ queryKey: ["vip", "me"] });
          navigate({ to: "/vip" });
        }}
        className="text-[10px] uppercase tracking-[0.4em] text-white/30 hover:text-white/70"
      >
        Sair
      </button>
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.02] p-4 text-center">
      <div className="text-2xl font-light">{n}</div>
      <div className="mt-1 text-[9px] uppercase tracking-[0.35em] text-white/40">{label}</div>
    </div>
  );
}

function CopyInviteButton({ url, onShared }: { url: string; onShared?: () => void }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
          try {
            (window as unknown as { plausible?: (n: string) => void }).plausible?.(
              "Copy Invite Link"
            );
          } catch { /* ignore */ }
          logInviteShare({ data: { channel: "copy_link" } })
            .then(() => onShared?.())
            .catch(() => { /* ignore */ });
        } catch { /* ignore */ }
      }}
      className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 border border-white/20 rounded hover:border-white/40"
    >
      {copied ? "Copiado ✓" : "Copiar"}
    </button>
  );
}

function InviteQrButton({ url, memberNumber, onShared }: { url: string; memberNumber: number; onShared?: () => void }) {
  const [open, setOpen] = useState(false);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function generate() {
    setLoading(true);
    try {
      const QR = await import("qrcode");
      // Cinematográfico: fundo preto absoluto, módulos em prata clara.
      const png = await QR.toDataURL(url, {
        errorCorrectionLevel: "H",
        margin: 2,
        width: 720,
        color: { dark: "#f0f0f0ff", light: "#000000ff" },
      });
      setDataUrl(png);
      setOpen(true);
      try {
        (window as unknown as { plausible?: (n: string) => void }).plausible?.(
          "Generate Invite QR"
        );
      } catch { /* ignore */ }
      logInviteShare({ data: { channel: "qr_generate" } }).catch(() => { /* ignore */ });
    } finally {
      setLoading(false);
    }
  }

  function download() {
    if (!dataUrl) return;
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `gea-convite-${String(memberNumber).padStart(4, "0")}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    try {
      (window as unknown as { plausible?: (n: string) => void }).plausible?.(
        "Download Invite QR"
      );
    } catch { /* ignore */ }
    logInviteShare({ data: { channel: "qr_download" } }).catch(() => { /* ignore */ });
  }

  return (
    <>
      <button
        onClick={generate}
        disabled={loading}
        className="text-[10px] uppercase tracking-[0.3em] px-3 py-1 border border-amber-400/40 bg-amber-400/[0.06] text-amber-300 rounded hover:bg-amber-400/[0.12] disabled:opacity-40"
      >
        {loading ? "Gerando…" : "QR Code"}
      </button>

      {open && dataUrl && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-6"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-black p-6 text-center"
          >
            <p className="text-[10px] uppercase tracking-[0.4em] text-amber-300/80">
              Convite Nº {String(memberNumber).padStart(4, "0")}
            </p>
            <div className="mt-4 rounded-lg bg-black p-3">
              <img
                src={dataUrl}
                alt="QR code do link de convite"
                className="mx-auto h-64 w-64"
              />
            </div>
            <p className="mt-4 break-all text-[10px] text-white/40">{url}</p>
            <div className="mt-5 flex gap-2">
              <button
                onClick={download}
                className="flex-1 rounded bg-white text-black py-2.5 text-[10px] uppercase tracking-[0.3em]"
              >
                Baixar PNG
              </button>
              <button
                onClick={() => setOpen(false)}
                className="rounded border border-white/20 px-4 py-2.5 text-[10px] uppercase tracking-[0.3em] text-white/70 hover:text-white"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
