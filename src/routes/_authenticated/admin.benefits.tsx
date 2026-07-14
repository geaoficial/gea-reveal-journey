import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  listAdminBenefits,
  upsertBenefit,
  deleteBenefit,
} from "@/lib/vip-admin.functions";

export const Route = createFileRoute("/_authenticated/admin/benefits")({
  component: BenefitsPage,
});

type Draft = {
  id?: string;
  title: string;
  description: string;
  type: "coupon" | "invite" | "offer" | "raffle" | "early_access" | "gift";
  code: string;
  active: boolean;
  min_invites: number;
  starts_at: string;
  ends_at: string;
};

const emptyDraft: Draft = {
  title: "",
  description: "",
  type: "coupon",
  code: "",
  active: true,
  min_invites: 0,
  starts_at: "",
  ends_at: "",
};

function BenefitsPage() {
  const list = useServerFn(listAdminBenefits);
  const upsert = useServerFn(upsertBenefit);
  const del = useServerFn(deleteBenefit);
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin", "benefits"], queryFn: () => list() });
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  const save = useMutation({
    mutationFn: () =>
      upsert({
        data: {
          id: draft.id,
          title: draft.title,
          description: draft.description || null,
          type: draft.type,
          code: draft.code || null,
          active: draft.active,
          min_invites: draft.min_invites,
          starts_at: draft.starts_at || null,
          ends_at: draft.ends_at || null,
        },
      }),
    onSuccess: () => {
      setDraft(emptyDraft);
      qc.invalidateQueries({ queryKey: ["admin", "benefits"] });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => del({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin", "benefits"] }),
  });

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <section>
        <h2 className="text-sm uppercase tracking-[0.35em] text-white/50">
          {draft.id ? "Editar benefício" : "Novo benefício"}
        </h2>
        <div className="mt-4 space-y-3">
          <Input label="Título" v={draft.title} on={(v) => setDraft({ ...draft, title: v })} />
          <Textarea
            label="Descrição"
            v={draft.description}
            on={(v) => setDraft({ ...draft, description: v })}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">Tipo</span>
              <select
                value={draft.type}
                onChange={(e) => setDraft({ ...draft, type: e.target.value as Draft["type"] })}
                className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded px-2 py-2 text-sm"
              >
                <option value="coupon">Cupom</option>
                <option value="offer">Oferta</option>
                <option value="invite">Convite</option>
                <option value="raffle">Sorteio</option>
                <option value="early_access">Acesso antecipado</option>
                <option value="gift">Brinde</option>
              </select>
            </label>
            <Input
              label="Código (opcional)"
              v={draft.code}
              on={(v) => setDraft({ ...draft, code: v })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Convites mínimos"
              v={String(draft.min_invites)}
              on={(v) => setDraft({ ...draft, min_invites: Number(v) || 0 })}
            />
            <label className="flex items-center gap-2 text-sm mt-6">
              <input
                type="checkbox"
                checked={draft.active}
                onChange={(e) => setDraft({ ...draft, active: e.target.checked })}
              />
              Ativo
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Início (ISO)"
              v={draft.starts_at}
              on={(v) => setDraft({ ...draft, starts_at: v })}
            />
            <Input
              label="Fim (ISO)"
              v={draft.ends_at}
              on={(v) => setDraft({ ...draft, ends_at: v })}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => save.mutate()}
              disabled={save.isPending || !draft.title}
              className="rounded bg-white text-black px-4 py-2 text-xs uppercase tracking-[0.3em] disabled:opacity-40"
            >
              {save.isPending ? "…" : draft.id ? "Salvar" : "Criar"}
            </button>
            {draft.id && (
              <button
                onClick={() => setDraft(emptyDraft)}
                className="text-[10px] uppercase tracking-[0.3em] text-white/50"
              >
                Cancelar
              </button>
            )}
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-[0.35em] text-white/50">Benefícios</h2>
        <ul className="mt-4 space-y-2">
          {(q.data?.benefits ?? []).map((b) => (
            <li
              key={b.id}
              className="rounded border border-white/10 bg-white/[0.02] p-3 flex items-start gap-3"
            >
              <div className="flex-1">
                <div className="text-sm">
                  {b.title}{" "}
                  <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 ml-2">
                    {b.type} · min {b.min_invites}
                  </span>
                </div>
                {b.description && <p className="text-xs text-white/50 mt-1">{b.description}</p>}
                <div className="text-[10px] text-white/40 mt-1">
                  {b.active ? "ativo" : "inativo"}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <button
                  onClick={() =>
                    setDraft({
                      id: b.id,
                      title: b.title,
                      description: b.description ?? "",
                      type: b.type as Draft["type"],
                      code: b.code ?? "",
                      active: b.active,
                      min_invites: b.min_invites,
                      starts_at: b.starts_at ?? "",
                      ends_at: b.ends_at ?? "",
                    })
                  }
                  className="text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-white"
                >
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm("Remover?")) remove.mutate(b.id);
                  }}
                  className="text-[10px] uppercase tracking-[0.3em] text-red-400/70 hover:text-red-400"
                >
                  Remover
                </button>
              </div>
            </li>
          ))}
          {(q.data?.benefits ?? []).length === 0 && (
            <p className="text-sm text-white/40">Nenhum benefício.</p>
          )}
        </ul>
      </section>
    </div>
  );
}

function Input({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">{label}</span>
      <input
        value={v}
        onChange={(e) => on(e.target.value)}
        className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded px-2 py-2 text-sm"
      />
    </label>
  );
}
function Textarea({ label, v, on }: { label: string; v: string; on: (v: string) => void }) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.35em] text-white/40">{label}</span>
      <textarea
        rows={3}
        value={v}
        onChange={(e) => on(e.target.value)}
        className="mt-1 w-full bg-white/[0.04] border border-white/10 rounded px-2 py-2 text-sm"
      />
    </label>
  );
}
