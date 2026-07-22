import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { confirmInstagramFollow } from "@/lib/vip-agent.functions";

const INSTAGRAM_URL = "https://instagram.com/geastoree";

/**
 * Etapa de verificação do Instagram — exibida após o cadastro
 * enquanto o membro ainda não confirmou que segue @geastoree.
 * Estrutura preparada para verificação automática futura via API do Instagram.
 */
export function VipInstagramStep({ firstName }: { firstName: string }) {
  const confirm = useServerFn(confirmInstagramFollow);
  const qc = useQueryClient();
  const [visited, setVisited] = useState(false);

  const mutation = useMutation({
    mutationFn: () => confirm(),
    onSuccess: (res) => {
      if (res.ok) {
        try {
          (window as unknown as { plausible?: (n: string) => void }).plausible?.(
            "VIP Instagram Confirmed",
          );
        } catch { /* ignore */ }
        qc.invalidateQueries({ queryKey: ["vip", "me"] });
      }
    },
  });

  const handleFollow = () => {
    setVisited(true);
    try {
      (window as unknown as { plausible?: (n: string) => void }).plausible?.(
        "VIP Instagram Click",
      );
    } catch { /* ignore */ }
    window.open(INSTAGRAM_URL, "_blank", "noopener,noreferrer");
  };

  return (
    <main className="mx-auto max-w-lg px-6 pb-24 pt-12 sm:pt-16">
      <p className="text-[10px] uppercase tracking-[0.4em] text-white/40">
        Etapa 2 de 2
      </p>
      <h1 className="mt-3 text-3xl font-light tracking-tight sm:text-4xl">
        Falta apenas um passo, {firstName}.
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-white/60">
        Siga a GEA no Instagram para liberar seus benefícios exclusivos.
      </p>

      <button
        type="button"
        onClick={handleFollow}
        className="mt-10 min-h-12 w-full rounded bg-white py-4 text-xs uppercase tracking-[0.4em] text-black transition hover:bg-white/90"
      >
        Seguir @geastoree no Instagram
      </button>

      <p className="mt-6 text-xs leading-relaxed text-white/55">
        Após seguir nossa página, clique em <span className="text-white">"Já estou seguindo"</span>.
      </p>

      <button
        type="button"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending || !visited}
        className="mt-4 min-h-12 w-full rounded border border-white/25 py-4 text-xs uppercase tracking-[0.35em] text-white transition hover:border-white/60 disabled:cursor-not-allowed disabled:opacity-30"
      >
        {mutation.isPending ? "Liberando…" : "Já estou seguindo"}
      </button>

      {!visited && (
        <p className="mt-3 text-[11px] leading-relaxed text-white/40">
          Clique primeiro em <span className="text-white/70">Seguir @geastoree</span> para habilitar a confirmação.
        </p>
      )}
    </main>
  );
}
