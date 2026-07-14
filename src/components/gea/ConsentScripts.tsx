import { useEffect } from "react";
import { CONSENT_EVENT, readConsent } from "@/lib/consent";

/**
 * Carrega scripts de terceiros dinamicamente conforme o consentimento.
 * - Plausible (analytics agregado, cookieless) → categoria "analytics".
 * - Ganchos prontos para Google Analytics, Meta Pixel e TikTok quando IDs forem fornecidos.
 */
export function ConsentScripts() {
  useEffect(() => {
    const apply = () => {
      const c = readConsent();
      if (!c) return;

      if (c.analytics) loadPlausible();
      // Placeholders — quando os IDs forem configurados via variáveis públicas.
      // if (c.analytics) loadGA(import.meta.env.VITE_GA4_ID);
      // if (c.marketing) loadMetaPixel(import.meta.env.VITE_META_PIXEL_ID);
      // if (c.marketing) loadTikTokPixel(import.meta.env.VITE_TIKTOK_PIXEL_ID);
    };

    apply();
    window.addEventListener(CONSENT_EVENT, apply);
    return () => window.removeEventListener(CONSENT_EVENT, apply);
  }, []);

  return null;
}

function loadPlausible() {
  if (document.getElementById("plausible-analytics")) return;
  // Bootstrap da fila global.
  const q = document.createElement("script");
  q.id = "plausible-queue";
  q.text =
    "window.plausible=window.plausible||function(){(window.plausible.q=window.plausible.q||[]).push(arguments)}";
  document.head.appendChild(q);

  const s = document.createElement("script");
  s.id = "plausible-analytics";
  s.defer = true;
  s.setAttribute("data-domain", "gea.lovable.app");
  s.src = "https://plausible.io/js/script.tagged-events.outbound-links.js";
  document.head.appendChild(s);
}
