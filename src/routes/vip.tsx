import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getMyVipMember, logoutVipMember } from "@/lib/vip-agent.functions";
import { VipRegisterForm } from "@/components/gea/vip/VipRegisterForm";
import { VipMemberArea } from "@/components/gea/vip/VipMemberArea";
import { VipInstagramStep } from "@/components/gea/vip/VipInstagramStep";

export const Route = createFileRoute("/vip")({
  head: () => ({
    meta: [
      { title: "GEA VIP — Programa de membros" },
      {
        name: "description",
        content:
          "Entre para a comunidade GEA e desbloqueie benefícios exclusivos, cupom de boas-vindas e programa de indicação.",
      },
      { property: "og:title", content: "GEA VIP" },
      {
        property: "og:description",
        content:
          "Entre para a comunidade GEA e desbloqueie benefícios exclusivos.",
      },
    ],
  }),
  component: VipPage,
});

function VipPage() {
  const getMe = useServerFn(getMyVipMember);
  const me = useQuery({
    queryKey: ["vip", "me"],
    queryFn: () => getMe(),
    staleTime: 30_000,
  });

  const isMember = me.data?.ok === true;
  const firstName = isMember
    ? (me.data.member.fullName || "").trim().split(/\s+/)[0] || "Membro"
    : "";

  return (
    <div className="min-h-screen bg-black text-white antialiased">
      <header className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
        <Link to="/" className="text-xs uppercase tracking-[0.5em]">GEA</Link>
        <span className="text-[10px] uppercase tracking-[0.4em] text-white/40">VIP</span>
        {isMember ? <LogoutButton /> : <span className="w-8" />}
      </header>

      {me.isLoading ? (
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="animate-pulse text-[10px] uppercase tracking-[0.5em] text-white/40">
            Carregando…
          </div>
        </div>
      ) : isMember ? (
        me.data.instagramConfirmed ? (
          <VipMemberArea member={me.data.member} />
        ) : (
          <VipInstagramStep firstName={firstName} />
        )
      ) : (
        <VisitorPanel />
      )}
    </div>
  );
}


function VisitorPanel() {
  return (
    <main className="mx-auto max-w-lg px-6 pb-24 pt-16 sm:pt-24">
      <h1 className="text-4xl font-light tracking-tight sm:text-5xl">GEA VIP</h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-white/60">
        Cadastre-se gratuitamente para receber benefícios exclusivos, novidades
        e promoções da GEA.
      </p>

      <div className="mt-10">
        <VipRegisterForm />
      </div>
    </main>
  );
}

function LogoutButton() {
  const logout = useServerFn(logoutVipMember);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const mutation = useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vip", "me"] });
      navigate({ to: "/vip" });
    },
  });
  return (
    <button
      type="button"
      onClick={() => mutation.mutate()}
      className="text-[10px] uppercase tracking-[0.35em] text-white/40 transition hover:text-white/80"
    >
      Sair
    </button>
  );
}
