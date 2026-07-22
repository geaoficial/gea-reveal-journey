import { useMemo, useState } from "react";

type Props = {
  memberNumber: number;
  firstName: string;
};

/**
 * Programa de indicação — link único do membro.
 * Copiar link + compartilhar via WhatsApp / share nativo.
 */
export function VipReferral({ memberNumber, firstName }: Props) {
  const [copied, setCopied] = useState(false);

  const link = useMemo(() => {
    if (typeof window === "undefined") return `/invite/${memberNumber}`;
    return `${window.location.origin}/invite/${memberNumber}`;
  }, [memberNumber]);

  const message = useMemo(
    () =>
      `${firstName} te convidou para a GEA VIP. Cadastre-se gratuitamente e receba benefícios exclusivos: ${link}`,
    [firstName, link],
  );

  const handleInvite = async () => {
    try {
      (window as unknown as { plausible?: (n: string) => void }).plausible?.("VIP Invite Share");
    } catch { /* ignore */ }

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "GEA VIP", text: message, url: link });
        return;
      } catch { /* fallthrough */ }
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch { /* ignore */ }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    } catch { /* ignore */ }
  };

  return (
    <section className="mt-14">
      <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/45">
        Indique um amigo
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        Convide um amigo para entrar na GEA VIP. Quando ele se cadastrar,
        seguir a GEA nas redes sociais e concluir a primeira compra,
        <span className="text-white"> vocês dois recebem 10% de desconto</span>.
      </p>

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate text-[12px] text-white/70">{link}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 rounded border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
        >
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>

      <button
        type="button"
        onClick={handleInvite}
        className="mt-4 min-h-11 w-full rounded bg-white py-3 text-xs uppercase tracking-[0.35em] text-black transition hover:bg-white/90"
      >
        Convidar amigo
      </button>
    </section>
  );
}
