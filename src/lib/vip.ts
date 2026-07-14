import { useEffect, useState, useCallback } from "react";

/**
 * Sistema de Selo VIP GEA — estado persistente do "Primeiros da GEA".
 *
 * Fluxo:
 *  1. Visitante clica em qualquer botão "Seguir @geastoree" → markPending()
 *  2. Ao voltar para a aba (visibilitychange), o overlay de unlock dispara
 *  3. Uma vez desbloqueado, VipArea aparece automaticamente em toda visita.
 */

const STORAGE_KEY = "gea.vip.v1";
const PENDING_KEY = "gea.vip.pending";

export type VipState = {
  status: "locked" | "unlocked";
  name: string | null;
  unlockedAt: string | null; // ISO
  memberId: string; // Nº exibido no cartão
  invitedCount: number;
  rewards: string[]; // ids desbloqueados
};

const defaultState: VipState = {
  status: "locked",
  name: null,
  unlockedAt: null,
  memberId: "",
  invitedCount: 0,
  rewards: [],
};

function readState(): VipState {
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw) as Partial<VipState>;
    return { ...defaultState, ...parsed };
  } catch {
    return defaultState;
  }
}

const SYNC_EVENT = "gea:vip:sync";

function writeState(state: VipState) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    window.dispatchEvent(new CustomEvent(SYNC_EVENT));
  } catch {
    /* ignore */
  }
}

function generateMemberId(): string {
  try {
    const existing = window.localStorage.getItem("gea.founder.number");
    if (existing) return String(existing).padStart(4, "0");
  } catch { /* ignore */ }
  const n = Math.floor(Math.random() * 899) + 100; // 100–998
  try {
    window.localStorage.setItem("gea.founder.number", String(n));
  } catch { /* ignore */ }
  return String(n).padStart(4, "0");
}

export function useVip() {
  const [state, setState] = useState<VipState>(defaultState);
  const [hydrated, setHydrated] = useState(false);
  const [justUnlocked, setJustUnlocked] = useState(false);

  useEffect(() => {
    setState(readState());
    setHydrated(true);
    const sync = () => setState(readState());
    window.addEventListener(SYNC_EVENT, sync);
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) sync();
    });
    return () => {
      window.removeEventListener(SYNC_EVENT, sync);
    };
  }, []);

  const persist = useCallback((next: VipState) => {
    setState(next);
    writeState(next);
  }, []);

  const markPending = useCallback(() => {
    try {
      window.sessionStorage.setItem(PENDING_KEY, String(Date.now()));
    } catch { /* ignore */ }
  }, []);

  const unlock = useCallback(() => {
    const current = readState();
    if (current.status === "unlocked") return;
    const next: VipState = {
      ...current,
      status: "unlocked",
      unlockedAt: new Date().toISOString(),
      memberId: current.memberId || generateMemberId(),
    };
    persist(next);
    setJustUnlocked(true);
    try {
      window.sessionStorage.removeItem(PENDING_KEY);
      const p = (window as unknown as { plausible?: (e: string, o?: { props?: Record<string,string> }) => void }).plausible;
      p?.("VIP Unlocked", { props: { memberId: next.memberId } });
    } catch { /* ignore */ }
  }, [persist]);

  const dismissUnlock = useCallback(() => setJustUnlocked(false), []);

  const setName = useCallback((name: string) => {
    const clean = name.trim().slice(0, 32);
    const next = { ...readState(), name: clean || null };
    persist(next);
  }, [persist]);

  const bumpInvited = useCallback(() => {
    const cur = readState();
    persist({ ...cur, invitedCount: cur.invitedCount + 1 });
  }, [persist]);

  // Detecta retorno após clique em "Seguir".
  useEffect(() => {
    if (!hydrated) return;
    const check = () => {
      if (document.visibilityState !== "visible") return;
      let pending: string | null = null;
      try { pending = window.sessionStorage.getItem(PENDING_KEY); } catch { /* ignore */ }
      if (!pending) return;
      // pelo menos 1.2s no Instagram para contar como intenção real
      const elapsed = Date.now() - Number(pending);
      if (elapsed < 1200) return;
      setTimeout(() => unlock(), 600);
    };
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [hydrated, unlock]);

  return {
    ...state,
    hydrated,
    justUnlocked,
    markPending,
    unlock,
    dismissUnlock,
    setName,
    bumpInvited,
  };
}

export function formatUnlockDate(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("pt-BR", {
      day: "2-digit", month: "short", year: "numeric",
    }).replace(/\./g, "");
  } catch {
    return "—";
  }
}
