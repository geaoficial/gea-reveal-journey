import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { trackInviteVisit } from "@/lib/vip-invite.functions";

export const Route = createFileRoute("/invite/$memberNumber")({
  head: () => ({
    meta: [
      { title: "Convite — Clube VIP GEA" },
      { name: "description", content: "Você foi convidado para o Clube VIP GEA." },
      { property: "og:title", content: "Convite — Clube VIP GEA" },
    ],
  }),
  component: InvitePage,
});

function InvitePage() {
  const { memberNumber } = Route.useParams();
  const track = useServerFn(trackInviteVisit);
  const num = Number(memberNumber);

  const q = useQuery({
    queryKey: ["invite", num],
    queryFn: () => track({ data: { memberNumber: num } }),
    enabled: Number.isInteger(num) && num > 0,
    staleTime: Infinity,
    retry: 0,
  });

  const sponsor = q.data?.ok ? q.data.sponsor : null;

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <p className="text-[10px] uppercase tracking-[0.5em] text-white/40">Convite pessoal</p>
        <h1 className="mt-4 text-3xl md:text-4xl font-light leading-tight">
          {sponsor ? (
            <>
              <em className="not-italic font-normal">{sponsor.fullName.split(" ")[0]}</em> te
              convidou para os <em className="not-italic font-normal">Primeiros da GEA</em>.
            </>
          ) : q.isLoading ? (
            "Verificando convite…"
          ) : (
            "Convite indisponível."
          )}
        </h1>
        {sponsor && (
          <p className="mt-4 text-sm text-white/60">
            Um cartão digital vitalício, benefícios exclusivos e acesso antecipado ao próximo drop.
          </p>
        )}
        <div className="mt-10 flex flex-col gap-3">
          <Link
            to="/vip"
            className="rounded bg-white text-black py-3 text-xs uppercase tracking-[0.4em]"
          >
            Aceitar e entrar no clube
          </Link>
          <Link
            to="/"
            className="text-[10px] uppercase tracking-[0.4em] text-white/40 hover:text-white/70"
          >
            Conhecer a GEA
          </Link>
        </div>
      </div>
    </div>
  );
}
