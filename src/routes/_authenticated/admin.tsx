import { createFileRoute, Outlet, Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/admin", label: "Visão geral" },
    { to: "/admin/members", label: "Membros" },
    { to: "/admin/invites", label: "Convites" },
    { to: "/admin/benefits", label: "Benefícios" },
  ] as const;

  return (
    <div className="min-h-screen bg-neutral-950 text-white">
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="text-xs uppercase tracking-[0.5em]">
          GEA · Admin
        </Link>
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            navigate({ to: "/auth" });
          }}
          className="text-[10px] uppercase tracking-[0.3em] text-white/50 hover:text-white"
        >
          Sair
        </button>
      </header>
      <nav className="flex gap-6 px-6 py-3 border-b border-white/[0.06] text-[10px] uppercase tracking-[0.35em]">
        {tabs.map((t) => (
          <Link
            key={t.to}
            to={t.to}
            className={pathname === t.to ? "text-white" : "text-white/40 hover:text-white"}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      <main className="p-6">
        <Outlet />
      </main>
    </div>
  );
}
