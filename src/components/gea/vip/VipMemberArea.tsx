import { useState } from "react";
import { VipCardMinimal } from "@/components/gea/VipCardMinimal";
import { VipReferral } from "./VipReferral";

type Member = {
  memberNumber: number;
  fullName: string;
  unlockedAt: string | null;
  couponCode: string;
  referralCode: string;
};

type Props = {
  member: Member;
};

const BENEFITS = [
  { title: "Cupom de boas-vindas", description: "Desconto exclusivo na sua primeira compra." },
  { title: "Benefícios exclusivos", description: "Vantagens reservadas para membros GEA VIP." },
  { title: "Promoções antecipadas", description: "Acesso primeiro a lançamentos e campanhas." },
  { title: "Programa de indicação", description: "Ganhe mais descontos ao convidar amigos." },
];

export function VipMemberArea({ member }: Props) {
  const firstName = (member.fullName || "").trim().split(/\s+/)[0] || "Membro";
  const [copied, setCopied] = useState(false);

  const handleCopyCoupon = async () => {
    try {
      await navigator.clipboard.writeText(member.couponCode);
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
          Cupom exclusivo — primeira compra
        </p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <span
            className="flex-1 truncate rounded-md border border-white/15 bg-black/40 px-4 py-3 text-center font-mono text-base tracking-[0.25em] text-white sm:text-lg"
            aria-label="Cupom"
          >
            {member.couponCode}
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
          Utilize este cupom na sua primeira compra. Válido apenas para você.
        </p>
      </section>

      <section className="mt-14">
        <h2 className="text-[10px] uppercase tracking-[0.4em] text-white/45">
          Seus benefícios
        </h2>
        <ul className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {BENEFITS.map((b) => (
            <li
              key={b.title}
              className="rounded-lg border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-center gap-2">
                <span aria-hidden className="text-white/70">✓</span>
                <span className="text-sm text-white">{b.title}</span>
              </div>
              <p className="mt-1.5 text-xs leading-relaxed text-white/55">
                {b.description}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <VipReferral
        memberNumber={member.memberNumber}
        firstName={firstName}
        referralCode={member.referralCode}
      />
    </main>
  );
}
