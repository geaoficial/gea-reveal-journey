/**
 * Telemetria de falhas de imagem.
 *
 * Objetivo: identificar rapidamente quais assets estão quebrando em
 * Safari iOS, redes lentas ou browsers com decode AVIF/WebP problemático.
 *
 * Envia eventos via Plausible (`window.plausible`) quando disponível e
 * também loga no console para debug local. Deduplica por asset+reason
 * dentro da mesma sessão para não inflar métricas.
 */

type Reason = "error" | "timeout" | "decode";

type ImageFailurePayload = {
  asset: string;
  reason: Reason;
  section?: string;
  /** Dimensões naturais do <img> no momento da falha (0 quando não decodou). */
  naturalWidth?: number;
  naturalHeight?: number;
};

const reported = new Set<string>();

function safeUA(): string {
  try {
    return typeof navigator !== "undefined" ? navigator.userAgent : "";
  } catch {
    return "";
  }
}

function safeConnection() {
  try {
    // @ts-expect-error Network Information API (non-standard)
    const c = typeof navigator !== "undefined" ? navigator.connection : undefined;
    if (!c) return { effectiveType: "unknown", saveData: false, downlink: undefined };
    return {
      effectiveType: c.effectiveType ?? "unknown",
      saveData: !!c.saveData,
      downlink: typeof c.downlink === "number" ? c.downlink : undefined,
    };
  } catch {
    return { effectiveType: "unknown", saveData: false, downlink: undefined };
  }
}

function detectPlatform(): string {
  const ua = safeUA();
  const isIOS = /iP(hone|ad|od)/.test(ua);
  const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(ua);
  if (isIOS && isSafari) return "safari-ios";
  if (isIOS) return "ios";
  if (isSafari) return "safari-desktop";
  if (/Android/.test(ua)) return "android";
  return "desktop";
}

/** Extrai só o nome do arquivo, sem query, para agrupar melhor no analytics. */
function normalizeAsset(url: string): string {
  if (!url) return "unknown";
  try {
    const clean = url.split("?")[0]!;
    const tail = clean.split("/").pop() || clean;
    return tail.slice(0, 120);
  } catch {
    return url.slice(0, 120);
  }
}

export function reportImageFailure(payload: ImageFailurePayload) {
  const asset = normalizeAsset(payload.asset);
  const key = `${asset}::${payload.reason}`;
  if (reported.has(key)) return;
  reported.add(key);

  const conn = safeConnection();
  const platform = detectPlatform();

  const props: Record<string, string | number | boolean> = {
    asset,
    reason: payload.reason,
    section: payload.section ?? "unknown",
    platform,
    effective_type: conn.effectiveType,
    save_data: conn.saveData,
    natural_width: payload.naturalWidth ?? 0,
    natural_height: payload.naturalHeight ?? 0,
  };
  if (typeof conn.downlink === "number") props.downlink = conn.downlink;

  try {
    // eslint-disable-next-line no-console
    console.warn("[image-telemetry] falha ao carregar imagem", props);
  } catch {
    /* noop */
  }

  try {
    // Plausible custom event — só dispara quando o script está presente.
    const w = window as unknown as {
      plausible?: (event: string, opts?: { props?: Record<string, unknown> }) => void;
    };
    w.plausible?.("Image Failure", { props });
  } catch {
    /* noop */
  }
}
