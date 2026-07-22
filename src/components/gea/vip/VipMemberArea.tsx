import { useState } from "react";
import { VipCardMinimal } from "@/components/gea/VipCardMinimal";
import { VipReferral } from "./VipReferral";

type Member = {
  memberNumber: number;
  fullName: string;
  unlockedAt: string | null;
};

type Props = {
  member: Member;
};

const DEFAULT_COUPON = "GEA10";

export function VipMemberArea({ member }: Props) {
  const firstName = (member.fullName || "").trim().split(/\s+/)[0] || "Membro";
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(DEFAULT_COUPON);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
      try {
        (window as unknown as { plausible?: (n: string) => void }).plausible?.("VIP Coupon Copy");
      } catch { /* ignore */ }
    } catch { /* ignore */ }
  };

  return (
    <main className="mx-auto max-w-xl px-6 pb-24 pt-12 sm:pt-16">
      <header className="mb-10">
        <h1 className="text-3xl font-light tracking-tight text-white sm:text-4xl">
          Olá, {firstName}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-white/60">
          Bem-vindo à GEA VIP. Seu benefício inicial já está disponível.
        </p>
      </header>

      <div className="flex justify-center">
        <VipCardMinimal
          name={member.fullName}
          memberId={String(member.memberNumber).padStart(4, "0")}
          unlockedAt={member.unlockedAt}
        />
      </div>

      <section className="mt-10 rounded-xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-white/45">
          Cupom exclusivo
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span
            className="flex-1 rounded-md border border-white/15 bg-black/40 px-4 py-3 text-center font-mono text-xl tracking-[0.4em] text-white"
            aria-label="Cupom"
          >
            {DEFAULT_COUPON}
          </span>
          <button
            type="button"
            onClick={handleCopyCoupon}
            className="shrink-0 rounded border border-white/20 px-4 py-3 text-[10px] uppercase tracking-[0.3em] text-white/80 transition hover:border-white/50 hover:text-white"
          >
            {copied ? "Copiado" : "Copiar"}
          </button>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-white/55">
          Utilize este cupom na sua primeira compra.
        </p>
      </section>

      <VipReferral memberNumber={member.memberNumber} firstName={firstName} />
    </main>
  );
}
