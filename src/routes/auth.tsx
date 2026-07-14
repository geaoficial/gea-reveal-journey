import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Área restrita — GEA" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: window.location.origin + "/admin" },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      navigate({ to: "/admin" });
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-xs tracking-[0.4em] text-white/50 uppercase">
          ← GEA
        </Link>
        <h1 className="mt-8 text-2xl font-light tracking-tight">
          {mode === "signin" ? "Entrar" : "Criar conta"}
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Área restrita ao time GEA. Membros do clube acessam em{" "}
          <Link to="/vip" className="underline">
            /vip
          </Link>
          .
        </p>
        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <label className="block">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">E-mail</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-white/40"
            />
          </label>
          <label className="block">
            <span className="text-xs uppercase tracking-[0.3em] text-white/40">Senha</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full bg-white/[0.04] border border-white/10 rounded px-3 py-2 focus:outline-none focus:border-white/40"
            />
          </label>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            disabled={busy}
            className="w-full rounded bg-white text-black py-2.5 text-sm tracking-wider uppercase disabled:opacity-50"
          >
            {busy ? "…" : mode === "signin" ? "Entrar" : "Criar conta"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-6 text-xs text-white/40 hover:text-white/70"
        >
          {mode === "signin" ? "Criar conta" : "Já tenho conta"}
        </button>
      </div>
    </div>
  );
}
