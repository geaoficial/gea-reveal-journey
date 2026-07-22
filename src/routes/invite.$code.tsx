import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/invite/$code")({
  beforeLoad: ({ params }) => {
    // Guarda o código do convidador para que a página /vip possa reagir
    // (banner discreto + crédito de indicação após conclusão das etapas).
    if (typeof window !== "undefined") {
      try {
        const code = (params.code || "").toUpperCase().slice(0, 32);
        if (code) {
          localStorage.setItem("gea_vip_invited_by", code);
          localStorage.setItem("gea_vip_invited_at", String(Date.now()));
        }
      } catch {
        // noop
      }
    }
    throw redirect({ to: "/vip", search: { invited: 1 } as never });
  },
});
