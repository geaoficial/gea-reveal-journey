/**
 * Envio não-bloqueante ao webhook do n8n após cadastro VIP.
 * Falhas aqui NUNCA cancelam o cadastro — apenas ficam nos logs.
 */
const TIMEOUT_MS = 4000;

export type VipN8nPayload = {
  name: string;
  email: string;
  whatsapp: string;
  memberId: string | null;
  memberNumber: number | null;
  registeredAt: string;
  source: "GEA VIP";
};

export async function notifyN8nVipSignup(payload: VipN8nPayload): Promise<void> {
  const url = process.env.N8N_VIP_WEBHOOK_URL;
  if (!url || !/^https:\/\//i.test(url)) {
    console.warn("[vip:n8n] N8N_VIP_WEBHOOK_URL ausente ou inválido — pulando notificação.");
    return;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "user-agent": "gea-vip/1.0 (+https://geastore.lovable.app)",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      const bodyPreview = await res.text().catch(() => "");
      console.error(
        `[vip:n8n] webhook respondeu ${res.status} ${res.statusText}: ${bodyPreview.slice(0, 300)}`,
      );
      return;
    }

    console.log(`[vip:n8n] webhook ok (${res.status}) para member #${payload.memberNumber ?? "?"}`);
  } catch (err) {
    const reason =
      err instanceof Error && err.name === "AbortError"
        ? `timeout após ${TIMEOUT_MS}ms`
        : err instanceof Error
          ? err.message
          : String(err);
    console.error(`[vip:n8n] falha ao enviar webhook: ${reason}`);
  } finally {
    clearTimeout(timer);
  }
}
