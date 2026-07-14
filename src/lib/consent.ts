import { useEffect, useState, useSyncExternalStore } from "react";

export type ConsentCategory = "essential" | "performance" | "analytics" | "marketing";

export type ConsentState = {
  essential: true;
  performance: boolean;
  analytics: boolean;
  marketing: boolean;
  updatedAt: string;
  version: number;
};

const KEY = "gea:consent:v1";
const VERSION = 1;

export const CONSENT_EVENT = "gea:consent-change";

export const defaultConsent = (): ConsentState => ({
  essential: true,
  performance: false,
  analytics: false,
  marketing: false,
  updatedAt: "",
  version: VERSION,
});

export function readConsent(): ConsentState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentState;
    if (parsed.version !== VERSION) return null;
    return { ...parsed, essential: true };
  } catch {
    return null;
  }
}

export function writeConsent(next: Partial<ConsentState>) {
  const base = readConsent() ?? defaultConsent();
  const merged: ConsentState = {
    ...base,
    ...next,
    essential: true,
    updatedAt: new Date().toISOString(),
    version: VERSION,
  };
  window.localStorage.setItem(KEY, JSON.stringify(merged));
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: merged }));
  return merged;
}

export function clearConsent() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT));
}

function subscribe(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CONSENT_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CONSENT_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function useConsent(): ConsentState | null {
  return useSyncExternalStore(
    subscribe,
    () => {
      const raw = window.localStorage.getItem(KEY);
      return raw ?? null;
    },
    () => null,
  ) === null
    ? null
    : readConsent();
}

/** True after mount to avoid SSR flash. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}
