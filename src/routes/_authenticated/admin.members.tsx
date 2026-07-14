import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAdminMembers,
  setMemberStatus,
  exportMembersCsv,
} from "@/lib/vip-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/members")({
  component: MembersPage,
});

function MembersPage() {
  const list = useServerFn(listAdminMembers);
  const setStatus = useServerFn(setMemberStatus);
  const csv = useServerFn(exportMembersCsv);
  const qc = useQueryClient();
  const [q, setQ] = useState("");

  const query = useQuery({
    queryKey: ["admin", "members", q],
    queryFn: () => list({ data: { q } }),
  });

  const mut = useMutation({
    mutationFn: (v: { memberId: string; status: "active" | "blocked" }) =>
      setStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "members"] }),
  });

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por nome, @ ou cidade…"
          className="w-72 bg-white/[0.04] border border-white/10 rounded px-3 py-2 text-sm"
        />
        <button
          onClick={async () => {
            const r = await csv();
            const blob = new Blob([r.csv], { type: "text/csv;charset=utf-8" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `gea-vip-membros-${new Date().toISOString().slice(0, 10)}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="text-[10px] uppercase tracking-[0.3em] px-3 py-2 border border-white/20 rounded"
        >
          Exportar CSV
        </button>
      </div>

      <div className="mt-6 overflow-x-auto rounded border border-white/10">
        <table className="w-full text-sm">
          <thead className="bg-white/[0.03] text-[10px] uppercase tracking-[0.3em] text-white/50">
            <tr>
              <th className="text-left px-3 py-2">Nº</th>
              <th className="text-left px-3 py-2">Nome</th>
              <th className="text-left px-3 py-2">Instagram</th>
              <th className="text-left px-3 py-2">Cidade</th>
              <th className="text-left px-3 py-2">Cadastro</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Ação</th>
            </tr>
          </thead>
          <tbody>
            {(query.data?.members ?? []).map((m) => (
              <tr key={m.id} className="border-t border-white/[0.06]">
                <td className="px-3 py-2 font-mono">
                  {String(m.member_number).padStart(4, "0")}
                </td>
                <td className="px-3 py-2">{m.full_name}</td>
                <td className="px-3 py-2 text-white/70">@{m.instagram_handle}</td>
                <td className="px-3 py-2 text-white/50">{m.city ?? "—"}</td>
                <td className="px-3 py-2 text-white/50">
                  {new Date(m.unlocked_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-3 py-2">
                  <span
                    className={
                      m.status === "active" ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {m.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <button
                    onClick={() =>
                      mut.mutate({
                        memberId: m.id,
                        status: m.status === "active" ? "blocked" : "active",
                      })
                    }
                    className="text-[10px] uppercase tracking-[0.3em] px-2 py-1 border border-white/20 rounded"
                  >
                    {m.status === "active" ? "Bloquear" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
            {(query.data?.members ?? []).length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-white/40 text-sm">
                  {query.isLoading ? "Carregando…" : "Nenhum membro."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
