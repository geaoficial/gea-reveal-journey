import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { listAdminInvites, setInviteStatus } from "@/lib/vip-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/invites")({
  component: InvitesPage,
});

function InvitesPage() {
  const list = useServerFn(listAdminInvites);
  const setStatus = useServerFn(setInviteStatus);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "invites"], queryFn: () => list() });

  const mut = useMutation({
    mutationFn: (v: { inviteId: string; status: "confirmed" | "rejected" }) =>
      setStatus({ data: v }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "invites"] }),
  });

  return (
    <div>
      <h1 className="text-lg font-light">Convites</h1>
      <p className="mt-1 text-xs text-white/50">
        Verifique se o convidado segue @geastoree antes de confirmar.
      </p>
      <div className="mt-6 space-y-2">
        {(q.data?.invites ?? []).map((i) => {
          const sponsor = i.sponsor as
            | { member_number: number; full_name: string; instagram_handle: string }
            | null;
          const invitee = i.invitee as
            | { member_number: number; full_name: string; instagram_handle: string }
            | null;
          return (
            <div
              key={i.id}
              className="rounded border border-white/10 bg-white/[0.02] p-4 flex flex-wrap items-center gap-4"
            >
              <div className="flex-1 min-w-[240px] text-sm">
                <div>
                  <span className="text-white/40 text-xs">Padrinho: </span>
                  {sponsor ? `#${sponsor.member_number} · @${sponsor.instagram_handle}` : "—"}
                </div>
                <div>
                  <span className="text-white/40 text-xs">Convidado: </span>
                  {invitee ? `#${invitee.member_number} · @${invitee.instagram_handle}` : "—"}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {new Date(i.created_at).toLocaleString("pt-BR")}
                </div>
              </div>
              <span
                className={
                  i.status === "confirmed"
                    ? "text-emerald-400 text-xs uppercase tracking-[0.3em]"
                    : i.status === "pending"
                      ? "text-amber-300 text-xs uppercase tracking-[0.3em]"
                      : "text-red-400 text-xs uppercase tracking-[0.3em]"
                }
              >
                {i.status}
              </span>
              {i.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => mut.mutate({ inviteId: i.id, status: "confirmed" })}
                    className="text-[10px] uppercase tracking-[0.3em] px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/40 rounded"
                  >
                    Confirmar
                  </button>
                  <button
                    onClick={() => mut.mutate({ inviteId: i.id, status: "rejected" })}
                    className="text-[10px] uppercase tracking-[0.3em] px-3 py-1.5 border border-white/20 rounded"
                  >
                    Rejeitar
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {(q.data?.invites ?? []).length === 0 && (
          <p className="text-sm text-white/40">
            {q.isLoading ? "Carregando…" : "Nenhum convite ainda."}
          </p>
        )}
      </div>
    </div>
  );
}
