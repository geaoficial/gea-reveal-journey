import { useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerVipMemberSimple } from "@/lib/vip-agent.functions";

type FieldErrors = Partial<Record<"fullName" | "email" | "whatsapp" | "form", string>>;

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/45">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

// Máscara visual: (DD) 9XXXX-XXXX / (DD) XXXX-XXXX. Aceita colar bruto.
function maskBrPhone(raw: string): string {
  const d = raw.replace(/\D+/g, "").slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'’\-]{2,}(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'’\-]{2,})+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(fullName: string, email: string, whatsapp: string): FieldErrors {
  const errors: FieldErrors = {};
  const name = fullName.replace(/\s+/g, " ").trim();
  if (!nameRegex.test(name)) errors.fullName = "Informe seu nome e sobrenome.";
  if (!emailRegex.test(email.trim())) errors.email = "Digite um e-mail válido.";
  const digits = whatsapp.replace(/\D+/g, "");
  let d = digits;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  const ddd = Number(d.slice(0, 2));
  const validPhone =
    (d.length === 10 || d.length === 11) &&
    ddd >= 11 &&
    ddd <= 99 &&
    (d.length !== 11 || d[2] === "9");
  if (!validPhone) errors.whatsapp = "Digite um número de WhatsApp válido.";
  return errors;
}

export function VipRegisterForm() {
  const register = useServerFn(registerVipMemberSimple);
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [success, setSuccess] = useState(false);

  const localErrors = useMemo(
    () => validate(fullName, email, whatsapp),
    [fullName, email, whatsapp],
  );

  const mutation = useMutation({
    mutationFn: (data: { fullName: string; email: string; whatsapp: string; acceptedTerms: true }) =>
      register({ data }),
    onSuccess: (res) => {
      if (res.ok) {
        setSuccess(true);
        try {
          (window as unknown as { plausible?: (n: string) => void }).plausible?.("VIP Signup");
        } catch { /* ignore */ }
        // Pequena pausa para exibir a animação de sucesso antes de trocar a tela.
        setTimeout(() => {
          qc.invalidateQueries({ queryKey: ["vip", "me"] });
        }, 900);
      } else if ("fieldErrors" in res && res.fieldErrors) {
        setServerErrors(res.fieldErrors as FieldErrors);
      } else {
        setServerErrors({ form: res.message || "Não foi possível concluir o cadastro." });
      }
    },
    onError: (err) => {
      console.error("[vip] register error", err);
      setServerErrors({ form: "Erro de conexão. Verifique sua internet e tente novamente." });
    },
  });

  const showErr = (field: "fullName" | "email" | "whatsapp") =>
    serverErrors[field] || (touched[field] ? localErrors[field] : undefined);

  const disabled = mutation.isPending || success;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (disabled) return;
    setTouched({ fullName: true, email: true, whatsapp: true });
    setServerErrors({});
    if (Object.keys(localErrors).length > 0) return;
    mutation.mutate({
      fullName: fullName.replace(/\s+/g, " ").trim(),
      email: email.trim().toLowerCase(),
      whatsapp: whatsapp.replace(/\D+/g, ""),
      acceptedTerms: true,
    });
  }

  if (success) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="animate-in fade-in flex flex-col items-center justify-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center duration-500"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20">
          <svg viewBox="0 0 24 24" className="h-6 w-6 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 12.5l4.5 4.5L19 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm text-white/80">Cadastro realizado com sucesso.</p>
        <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">Bem-vindo à GEA VIP.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <Field label="Nome completo" error={showErr("fullName")}>
        <input
          required
          maxLength={80}
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
          className="vip-input"
          placeholder="Ex: Maria Clara"
        />
      </Field>
      <Field label="E-mail" error={showErr("email")}>
        <input
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={160}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (serverErrors.email) setServerErrors((s) => ({ ...s, email: undefined }));
          }}
          onBlur={() => setTouched((t) => ({ ...t, email: true }))}
          className="vip-input"
          placeholder="voce@email.com"
        />
      </Field>
      <Field label="WhatsApp" error={showErr("whatsapp")}>
        <input
          required
          inputMode="tel"
          autoComplete="tel"
          maxLength={20}
          placeholder="(16) 99346-4038"
          value={whatsapp}
          onChange={(e) => setWhatsapp(maskBrPhone(e.target.value))}
          onBlur={() => setTouched((t) => ({ ...t, whatsapp: true }))}
          className="vip-input"
        />
      </Field>

      {serverErrors.form && <p className="text-sm text-red-400">{serverErrors.form}</p>}

      <button
        type="submit"
        disabled={disabled}
        aria-busy={mutation.isPending}
        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded bg-white py-3 text-xs uppercase tracking-[0.35em] text-black transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {mutation.isPending && (
          <span className="inline-block h-3 w-3 animate-spin rounded-full border border-black/30 border-t-black" aria-hidden />
        )}
        {mutation.isPending ? "Enviando…" : "Entrar para GEA VIP"}
      </button>

      <style>{`.vip-input{margin-top:.5rem;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:.375rem;padding:.75rem .875rem;color:white;font-size:15px;outline:none;transition:border-color .2s}.vip-input:focus{border-color:rgba(255,255,255,.45)}`}</style>
    </form>
  );
}
