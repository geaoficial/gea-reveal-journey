import { useEffect, useState } from "react";

export type DeviceTier = "low" | "high";

interface Capability {
  tier: DeviceTier;
  reducedMotion: boolean;
  saveData: boolean;
  /** true = allow heavy cinematic FX (grain, trailer, spotlight, blur layers) */
  allowHeavyFx: boolean;
}

function detect(): Capability {
  if (typeof window === "undefined") {
    return { tier: "high", reducedMotion: false, saveData: false, allowHeavyFx: true };
  }
  const reducedMotion =
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  // @ts-expect-error - Network Information API (non-standard)
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const saveData = !!conn?.saveData;
  const slowNet = conn?.effectiveType ? /2g|slow-2g/.test(conn.effectiveType) : false;
  const cores = navigator.hardwareConcurrency ?? 4;
  // @ts-expect-error - deviceMemory (non-standard)
  const memory = navigator.deviceMemory ?? 4;
  const lowHw = cores <= 4 && memory <= 2;
  const tier: DeviceTier = reducedMotion || saveData || slowNet || lowHw ? "low" : "high";
  return {
    tier,
    reducedMotion,
    saveData: saveData || slowNet,
    allowHeavyFx: tier === "high" && !reducedMotion,
  };
}

/** SSR-safe: returns "high" on server, real value after mount. */
export function useDeviceCapability(): Capability {
  const [cap, setCap] = useState<Capability>({
    tier: "high",
    reducedMotion: false,
    saveData: false,
    allowHeavyFx: true,
  });
  useEffect(() => {
    setCap(detect());
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setCap(detect());
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return cap;
}
