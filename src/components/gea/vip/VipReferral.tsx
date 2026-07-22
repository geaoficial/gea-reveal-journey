import { useEffect, useMemo, useState } from "react";

type Props = {
  memberNumber: number;
  firstName: string;
  referralCode: string;
};

/**
 * Programa de indicação — link + código únicos do membro.
 * Copiar link, copiar código e compartilhar via share nativo / WhatsApp.
 */
export function VipReferral({ memberNumber, firstName, referralCode }: Props) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") setOrigin(window.location.origin);
  }, []);

  const link = useMemo(
    () => `${origin}/invite/${memberNumber}`,
    [origin, memberNumber],
  );


  const message = useMemo(
    () =>
      `${firstName} te convidou para a GEA VIP. Cadastre-se gratuitamente e receba benefícios exclusivos: ${link}`,
    [firstName, link],
  );

  const track = (name: string) => {
    try {
      (window as unknown as { plausible?: (n: string) => void }).plausible?.(name);
    } catch { /* ignore */ }
  };

  const copy = async (value: string, setter: (v: boolean) => void) => {
    try {
      await navigator.clipboard.writeText(value);
      setter(true);
      setTimeout(() => setter(false), 2200);
    } catch { /* ignore */ }
  };

  const handleShare = async () => {
    track("VIP Invite Share");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: "GEA VIP", text: message, url: link });
        return;
      } catch { /* fallthrough */ }
    }
    copy(link, setCopiedLink);
  };

  return (
    <section className="mt-14">
      <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/45">
        Indique um amigo
      </h2>
      <p className="mt-4 text-sm leading-relaxed text-white/70">
        Convide um amigo para fazer parte da GEA VIP. Quando ele se cadastrar,
        seguir a GEA no Instagram e concluir a primeira compra,
        <span className="text-white"> vocês dois recebem 10% de desconto</span> em uma próxima compra.
      </p>

      <div className="mt-6 space-y-3">
        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate text-[12px] text-white/70">{link}</span>
          <button
            type="button"
            onClick={() => { track("VIP Invite Copy Link"); copy(link, setCopiedLink); }}
            className="shrink-0 rounded border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            {copiedLink ? "Copiado" : "Copiar link"}
          </button>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
          <span className="min-w-0 flex-1 truncate font-mono text-[13px] tracking-[0.3em] text-white">
            {referralCode}
          </span>
          <button
            type="button"
            onClick={() => { track("VIP Invite Copy Code"); copy(referralCode, setCopiedCode); }}
            className="shrink-0 rounded border border-white/15 px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] text-white/70 transition hover:border-white/40 hover:text-white"
          >
            {copiedCode ? "Copiado" : "Copiar código"}
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={handleShare}
        className="mt-4 min-h-11 w-full rounded bg-white py-3 text-xs uppercase tracking-[0.35em] text-black transition hover:bg-white/90"
      >
        Convidar amigo
      </button>
    </section>
  );
}
