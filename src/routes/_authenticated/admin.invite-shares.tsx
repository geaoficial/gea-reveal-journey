import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getInviteShareStats } from "@/lib/vip-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/invite-shares")({
  component: InviteSharesPage,
});

const PERIODS = [
  { days: 1, label: "24h" },
  { days: 7, label: "7 dias" },
  { days: 30, label: "30 dias" },
  { days: 90, label: "90 dias" },
  { days: 365, label: "1 ano" },
] as const;

const CHANNEL_LABEL: Record<string, string> = {
  whatsapp: "WhatsApp",
  copy_link: "Copiar link",
  qr_generate: "QR gerado",
  qr_download: "QR baixado",
};

function InviteSharesPage() {
  const [days, setDays] = useState<number>(30);
  const fn = useServerFn(getInviteShareStats);
  const q = useQuery({
    queryKey: ["admin", "invite-shares", days],
    queryFn: () => fn({ data: { days } }),
  });

  const data = q.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-light">Compartilhamentos de convite</h1>
          <p className="mt-1 text-[10px] uppercase tracking-[0.35em] text-white/40">
            Agrupado por canal e por membro
          </p>
        </div>
        <div className="flex gap-1 rounded border border-white/10 bg-white/[0.02] p-1">
          {PERIODS.map((p) => (
            <button
              key={p.days}
              onClick={() => setDays(p.days)}
              className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.3em] rounded transition ${
                days === p.days ? "bg-white text-black" : "text-white/50 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {q.isLoading ? (
        <div className="text-xs text-white/40">Carregando…</div>
      ) : q.isError ? (
        <div className="text-xs text-red-400">Falha ao carregar.</div>
      ) : !data ? null : (
        <>
          <section>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3">
              Total no período · {data.total}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {(["whatsapp", "copy_link", "qr_generate", "qr_download"] as const).map((ch) => {
                const found = data.channels.find((c) => c.channel === ch);
                const count = found?.count ?? 0;
                const pct = data.total > 0 ? Math.round((count / data.total) * 100) : 0;
                return (
                  <div key={ch} className="rounded border border-white/10 bg-white/[0.02] p-4">
                    <div className="text-[9px] uppercase tracking-[0.4em] text-white/40">
                      {CHANNEL_LABEL[ch]}
                    </div>
                    <div className="mt-2 text-2xl font-light">{count}</div>
                    <div className="mt-1 text-[10px] text-white/30">{pct}%</div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="text-[10px] uppercase tracking-[0.4em] text-white/40 mb-3">
              Por membro
            </div>
            <div className="overflow-x-auto rounded border border-white/10">
              <table className="w-full text-sm">
                <thead className="bg-white/[0.03] text-[9px] uppercase tracking-[0.3em] text-white/40">
                  <tr>
                    <th className="text-left px-4 py-3">#</th>
                    <th className="text-left px-4 py-3">Membro</th>
                    <th className="text-left px-4 py-3">Instagram</th>
                    <th className="text-right px-4 py-3">WhatsApp</th>
                    <th className="text-right px-4 py-3">Copiar</th>
                    <th className="text-right px-4 py-3">QR ger.</th>
                    <th className="text-right px-4 py-3">QR baix.</th>
                    <th className="text-right px-4 py-3">Total</th>
                    <th className="text-left px-4 py-3">Último</th>
                  </tr>
                </thead>
                <tbody>
                  {data.members.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-6 text-center text-white/40 text-xs">
                        Sem compartilhamentos neste período.
                      </td>
                    </tr>
                  ) : (
                    data.members.map((m) => (
                      <tr key={m.memberId} className="border-t border-white/[0.06]">
                        <td className="px-4 py-2 text-white/50">
                          {m.member_number != null ? String(m.member_number).padStart(4, "0") : "—"}
                        </td>
                        <td className="px-4 py-2">{m.full_name}</td>
                        <td className="px-4 py-2 text-white/50">
                          {m.instagram_handle ? `@${m.instagram_handle}` : "—"}
                        </td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.whatsapp}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.copy_link}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.qr_generate}</td>
                        <td className="px-4 py-2 text-right tabular-nums">{m.qr_download}</td>
                        <td className="px-4 py-2 text-right tabular-nums font-medium">{m.total}</td>
                        <td className="px-4 py-2 text-white/40 text-xs">
                          {new Date(m.last).toLocaleString("pt-BR")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
