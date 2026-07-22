import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { registerVipMemberSimple } from "@/lib/vip-agent.functions";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/45">{label}</span>
      {children}
    </label>
  );
}

/**
 * Cadastro GEA VIP — Nome, E-mail e WhatsApp.
 * Após sucesso, invalida a query "vip.me" e a área do membro aparece.
 */
export function VipRegisterForm() {
  const register = useServerFn(registerVipMemberSimple);
  const qc = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const mutation = useMutation({
    mutationFn: (data: { fullName: string; email: string; whatsapp: string; acceptedTerms: true }) =>
      register({ data }),
    onSuccess: (res) => {
      if (res.ok) {
        try {
          (window as unknown as { plausible?: (n: string) => void }).plausible?.("VIP Signup");
        } catch { /* ignore */ }
        qc.invalidateQueries({ queryKey: ["vip", "me"] });
      }
    },
  });

  const res = mutation.data;
  const errMsg = res && !res.ok ? res.message : mutation.error ? "Erro inesperado." : null;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (mutation.isPending) return;
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

      {errMsg && <p className="text-sm text-red-400">{errMsg}</p>}

      <button
        type="submit"
        disabled={mutation.isPending}
        className="mt-2 min-h-11 w-full rounded bg-white py-3 text-xs uppercase tracking-[0.35em] text-black transition disabled:opacity-30"
      >
        {mutation.isPending ? "Entrando…" : "Entrar para GEA VIP"}
      </button>

      <style>{`.vip-input{margin-top:.5rem;width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);border-radius:.375rem;padding:.75rem .875rem;color:white;font-size:15px;outline:none;transition:border-color .2s}.vip-input:focus{border-color:rgba(255,255,255,.45)}`}</style>
    </form>
  );
}
