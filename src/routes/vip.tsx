import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  getMyVipMember,
  registerVipMemberSimple,
  loginVipMemberSimple,
  logoutVipMember,
} from "@/lib/vip-agent.functions";
import { VipCardMinimal } from "@/components/gea/VipCardMinimal";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "GEA VIP — Comunidade exclusiva" },
      {
        name: "description",
        content:
          "Faça parte da GEA VIP: descontos exclusivos, acesso antecipado e benefícios reservados aos membros.",
      },
      { property: "og:title", content: "GEA VIP" },
      {
        property: "og:description",
        content: "Comunidade exclusiva com benefícios reservados aos membros GEA.",
      },
    ],
  }),
  component: VipPage,
});

const BENEFITS = [
  "Descontos exclusivos para membros",
  "Acesso antecipado a novidades",
  "Campanhas especiais",
  "Benefícios reservados para clientes GEA",
];

// ------------------------------------------------------------------
function VipPage() {
  const getMe = useServerFn(getMyVipMember);
  const me = useQuery({
    queryKey: ["vip", "me"],
    queryFn: () => getMe(),
    staleTime: 30_000,
  });

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
        <Link to="/" className="text-xs uppercase tracking-[0.5em]">
          GEA
        </Link>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          VIP
        </span>
      </header>

      {me.isLoading ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="animate-pulse text-[10px] uppercase tracking-[0.5em] text-white/40">
            Carregando…
          </div>
        </div>
      ) : me.data?.ok ? (
        <MemberPanel data={me.data} />
      ) : (
        <VisitorPanel />
      )}
    </div>
  );
}

// ------------------------------------------------------------------
function VisitorPanel() {
  const [mode, setMode] = useState<"register" | "login">("register");
  return (
    <main className="mx-auto max-w-lg px-6 pb-24 pt-16 sm:pt-24">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      >
        <h1 className="text-4xl font-light tracking-tight sm:text-5xl">GEA VIP</h1>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
          Faça parte de uma comunidade exclusiva e tenha acesso a benefícios
          especiais.
        </p>
      </motion.div>

      <ul className="mt-10 grid gap-2 sm:grid-cols-2">
        {BENEFITS.map((b, i) => (
          <motion.li
            key={b}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 + i * 0.06 }}
            className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px] text-white/80"
          >
            <span
              aria-hidden
              className="h-1 w-1 shrink-0 rounded-full bg-white/70"
            />
            {b}
          </motion.li>
        ))}
      </ul>

      <div className="mt-10 flex gap-8 text-[11px] uppercase tracking-[0.35em]">
        <button
          type="button"
          onClick={() => setMode("register")}
          className={
            mode === "register"
              ? "text-white"
              : "text-white/40 hover:text-white/70"
          }
        >
          Novo membro
        </button>
        <button
          type="button"
          onClick={() => setMode("login")}
          className={
            mode === "login" ? "text-white" : "text-white/40 hover:text-white/70"
          }
        >
          Já sou membro
        </button>
      </div>

      <div className="mt-6">
        {mode === "register" ? <RegisterForm /> : <LoginForm />}
      </div>
    </main>
  );
}

// ------------------------------------------------------------------
function RegisterForm() {
  const register = useServerFn(registerVipMemberSimple);
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [accepted, setAccepted] = useState(true);

  const mutation = useMutation({
    mutationFn: (data: {
      fullName: string;
      email: string;
      whatsapp: string;
      acceptedTerms: true;
    }) => register({ data }),
    onSuccess: (res) => {
      if (res.ok) {
        try {
          (
            window as unknown as { plausible?: (n: string) => void }
          ).plausible?.("VIP Signup Simple");
        } catch {
          /* ignore */
        }
        qc.invalidateQueries({ queryKey: ["vip", "me"] });
      }
    },
  });

  const res = mutation.data;
  const errMsg =
    res && !res.ok ? res.message : mutation.error ? "Erro inesperado." : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (!accepted || mutation.isPending) return;
        mutation.mutate({
          fullName: fullName.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim(),
          acceptedTerms: true,
        });
      }}
      className="space-y-4"
      noValidate
    >
      <Field label="Nome">
        <input
          required
          minLength={2}
          maxLength={80}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="vip-input"
        />
      </Field>
      <Field label="E-mail">
        <input
          required
          type="email"
          autoComplete="email"
          maxLength={160}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="vip-input"
        />
      </Field>
      <Field label="WhatsApp">
        <input
          required
          inputMode="tel"
          autoComplete="tel"
          minLength={8}
          maxLength={24}
          placeholder="(11) 99999-9999"
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="vip-input"
        />
      </Field>

      <label className="flex items-start gap-3 pt-1 text-xs text-white/55">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-0.5 accent-white"
        />
        <span>
          Aceito receber comunicações da GEA e concordo com o regulamento do
          clube.
        </span>
      </label>

      {errMsg && <p className="text-sm text-red-400">{errMsg}</p>}

      <button
        type="submit"
        disabled={!accepted || mutation.isPending}
        className="mt-2 min-h-11 w-full rounded bg-white py-3 text-xs uppercase tracking-[0.35em] text-black transition disabled:opacity-30"
      >
        {mutation.isPending ? "Entrando…" : "Entrar para a GEA VIP"}
      </button>

      <style>{`.vip-input{margin-top:.5rem;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:.375rem;padding:.75rem .875rem;color:white;font-size:15px;outline:none;transition:border-color .2s}.vip-input:focus{border-color:rgba(255,255,255,.45)}`}</style>
    </form>
  );
}

// ------------------------------------------------------------------
function LoginForm() {
  const login = useServerFn(loginVipMemberSimple);
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { email: string; accessCode: string }) =>
      login({ data }),
    onSuccess: (res) => {
      if (res.ok) qc.invalidateQueries({ queryKey: ["vip", "me"] });
    },
  });

  const res = mutation.data;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (mutation.isPending) return;
        mutation.mutate({ email: email.trim(), accessCode: accessCode.trim() });
      }}
      className="space-y-4"
      noValidate
    >
      <Field label="E-mail">
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="vip-input"
        />
      </Field>
      <Field label="Código de acesso">
        <input
          required
          value={accessCode}
          onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
          className="vip-input font-mono tracking-[0.3em]"
        />
      </Field>
      {res && !res.ok && <p className="text-sm text-red-400">{res.message}</p>}
      <button
        type="submit"
        disabled={mutation.isPending}
        className="min-h-11 w-full rounded bg-white py-3 text-xs uppercase tracking-[0.35em] text-black transition disabled:opacity-30"
      >
        {mutation.isPending ? "…" : "Entrar"}
      </button>
      <style>{`.vip-input{margin-top:.5rem;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:.375rem;padding:.75rem .875rem;color:white;font-size:15px;outline:none;transition:border-color .2s}.vip-input:focus{border-color:rgba(255,255,255,.45)}`}</style>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/45">
        {label}
      </span>
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
  const qc = useQueryClient();
  const { member } = data;
  const [welcoming, setWelcoming] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setWelcoming(false), 900);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="mx-auto max-w-xl px-6 pb-24 pt-12 sm:pt-16">
      <AnimatePresence>
        {welcoming && (
          <motion.div
            key="welcome-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-black"
            aria-hidden
          >
            <motion.span
              initial={{ opacity: 0, letterSpacing: "0.6em" }}
              animate={{ opacity: 1, letterSpacing: "0.35em" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-3xl font-light"
              style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
            >
              GEA VIP
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="mb-8 text-center"
      >
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">
          Bem-vindo à GEA VIP
        </p>
        <p className="mt-3 text-sm text-white/60">
          Seu acesso exclusivo foi liberado.
        </p>
      </motion.header>

      <div className="flex justify-center">
        <VipCardMinimal
          name={member.fullName}
          memberId={String(member.memberNumber).padStart(4, "0")}
          unlockedAt={member.unlockedAt}
        />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1.1 }}
        className="mt-12"
      >
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/40">
          Seus benefícios
        </h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li
              key={b}
              className="rounded-lg border border-white/10 bg-white/[0.02] px-4 py-3 text-[13px] text-white/80"
            >
              {b}
            </li>
          ))}
        </ul>
      </motion.section>

      <div className="mt-14 flex items-center justify-between text-[10px] uppercase tracking-[0.4em]">
        <Link to="/" className="text-white/40 hover:text-white/80">
          ← Voltar
        </Link>
        <button
          type="button"
          onClick={async () => {
            await logout();
            qc.invalidateQueries({ queryKey: ["vip", "me"] });
            navigate({ to: "/vip" });
          }}
          className="text-white/30 hover:text-white/70"
        >
          Sair
        </button>
      </div>
    </main>
  );
}
