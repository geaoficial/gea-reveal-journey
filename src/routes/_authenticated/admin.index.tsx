import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getAdminMetrics } from "@/lib/vip-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const fn = useServerFn(getAdminMetrics);
  const q = useQuery({ queryKey: ["admin", "metrics"], queryFn: () => fn() });
  const m = q.data;

  return (
    <div>
      <h1 className="text-lg font-light">Visão geral</h1>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card label="Membros" v={m?.totalMembers} />
        <Card label="24h" v={m?.newLast24h} />
        <Card label="7 dias" v={m?.newLast7d} />
        <Card label="Convites pendentes" v={m?.pendingInvites} />
        <Card label="Confirmados" v={m?.confirmedInvites} />
      </div>
    </div>
  );
}

function Card({ label, v }: { label: string; v: number | undefined }) {
  return (
    <div className="rounded border border-white/10 bg-white/[0.02] p-4">
      <div className="text-[9px] uppercase tracking-[0.4em] text-white/40">{label}</div>
      <div className="mt-2 text-2xl font-light">{v ?? "—"}</div>
    </div>
  );
}
