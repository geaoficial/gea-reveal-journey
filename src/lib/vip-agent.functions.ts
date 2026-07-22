/**
 * Agente VIP GEA — server functions públicas (não autenticadas via Supabase).
 * Sessão do membro via cookie HMAC HttpOnly (VIP_SESSION_SECRET).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

// ------------------------------------------------------------------
// Schemas
// ------------------------------------------------------------------
const instagramRegex = /^[a-zA-Z0-9._]{1,30}$/;

const registerSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@+/, "").toLowerCase())
    .refine((v) => instagramRegex.test(v), { message: "Formato inválido de @ do Instagram" }),
  city: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : null)),
  acceptedTerms: z.literal(true),
});

// Cadastro simplificado (novo fluxo minimalista do Clube VIP): nome + e-mail + WhatsApp.
const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ'’\-]{2,}(?:\s+[A-Za-zÀ-ÖØ-öø-ÿ'’\-]{2,})+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function normalizeName(v: string): string {
  return v.replace(/\s+/g, " ").trim();
}

function normalizeWhatsapp(v: string): string {
  // Mantém apenas dígitos
  return v.replace(/\D+/g, "");
}

function isValidBrWhatsapp(digits: string): boolean {
  // Aceita 10 ou 11 dígitos (DDD + número). Também aceita com 55 na frente (12 ou 13).
  let d = digits;
  if ((d.length === 12 || d.length === 13) && d.startsWith("55")) d = d.slice(2);
  if (d.length !== 10 && d.length !== 11) return false;
  const ddd = Number(d.slice(0, 2));
  if (!Number.isFinite(ddd) || ddd < 11 || ddd > 99) return false;
  // Celular (11 dígitos) começa com 9
  if (d.length === 11 && d[2] !== "9") return false;
  return true;
}

const registerSimpleSchema = z.object({
  fullName: z
    .string()
    .transform(normalizeName)
    .refine((v) => v.length >= 3 && v.length <= 80, { message: "Informe seu nome e sobrenome." })
    .refine((v) => nameRegex.test(v), { message: "Informe seu nome e sobrenome." }),
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(160, { message: "Digite um e-mail válido." })
    .refine((v) => emailRegex.test(v), { message: "Digite um e-mail válido." }),
  whatsapp: z
    .string()
    .transform(normalizeWhatsapp)
    .refine(isValidBrWhatsapp, { message: "Digite um número de WhatsApp válido." }),
  acceptedTerms: z.literal(true),
});

const loginSchema = z.object({
  instagram: z
    .string()
    .trim()
    .transform((v) => v.replace(/^@+/, "").toLowerCase())
    .refine((v) => instagramRegex.test(v)),
  accessCode: z.string().trim().min(6).max(16),
});

const loginSimpleSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(160),
  accessCode: z.string().trim().min(6).max(16),
});

// ------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------
function generateAccessCode(): string {
  // 8 chars sem confusão visual
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  const arr = new Uint32Array(8);
  crypto.getRandomValues(arr);
  for (let i = 0; i < 8; i++) out += alphabet[arr[i] % alphabet.length];
  return out;
}

// ------------------------------------------------------------------
// registerVipMember
// ------------------------------------------------------------------
export const registerVipMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => registerSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { readInviteSponsorCookie, clearInviteSponsorCookie, issueSessionCookie } =
      await import("./vip-session.server");

    // Duplicidade
    const { data: existing } = await supabaseAdmin
      .from("vip_members")
      .select("id, member_number")
      .eq("instagram_handle", data.instagram)
      .maybeSingle();
    if (existing) {
      return {
        ok: false as const,
        reason: "already_member" as const,
        message: "Você já faz parte dos Primeiros da GEA.",
        memberNumber: existing.member_number,
      };
    }

    // Padrinho
    const sponsorNumber = readInviteSponsorCookie();
    let sponsorId: string | null = null;
    if (sponsorNumber) {
      const { data: sp } = await supabaseAdmin
        .from("vip_members")
        .select("id")
        .eq("member_number", sponsorNumber)
        .maybeSingle();
      if (sp) sponsorId = sp.id;
    }

    const accessCode = generateAccessCode();

    const { data: inserted, error } = await supabaseAdmin
      .from("vip_members")
      .insert({
        full_name: data.fullName,
        instagram_handle: data.instagram,
        city: data.city,
        access_code: accessCode,
        invited_by: sponsorId,
      })
      .select("id, member_number, full_name, instagram_handle, city, unlocked_at, access_code")
      .single();

    if (error || !inserted) {
      return {
        ok: false as const,
        reason: "server_error" as const,
        message: "Falha ao cadastrar. Tente novamente.",
      };
    }

    // Evento signup
    await supabaseAdmin.from("vip_events").insert({
      member_id: inserted.id,
      type: "signup",
      payload: { via: sponsorId ? "invite" : "direct" },
    });

    // Invite pendente
    if (sponsorId) {
      await supabaseAdmin.from("vip_invites").insert({
        sponsor_id: sponsorId,
        invitee_id: inserted.id,
        status: "pending",
      });
      clearInviteSponsorCookie();
    }

    issueSessionCookie(inserted.id);

    return {
      ok: true as const,
      member: {
        id: inserted.id,
        memberNumber: inserted.member_number,
        fullName: inserted.full_name,
        instagram: inserted.instagram_handle,
        city: inserted.city,
        unlockedAt: inserted.unlocked_at,
        accessCode: inserted.access_code, // enviado UMA vez após o cadastro
      },
    };
  });

// ------------------------------------------------------------------
// loginVipMember (por @ + código)
// ------------------------------------------------------------------
export const loginVipMember = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { issueSessionCookie } = await import("./vip-session.server");

    const { data: member } = await supabaseAdmin
      .from("vip_members")
      .select("id, access_code, status")
      .eq("instagram_handle", data.instagram)
      .maybeSingle();

    if (!member || member.access_code !== data.accessCode || member.status !== "active") {
      return { ok: false as const, message: "Dados inválidos." };
    }

    issueSessionCookie(member.id);
    return { ok: true as const };
  });

// ------------------------------------------------------------------
// registerVipMemberSimple — fluxo minimalista Nome + E-mail + WhatsApp
// ------------------------------------------------------------------
export const registerVipMemberSimple = createServerFn({ method: "POST" })
  .validator((data: unknown) => {
    const parsed = registerSimpleSchema.safeParse(data);
    if (parsed.success) return { kind: "ok" as const, data: parsed.data };
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { kind: "invalid" as const, fieldErrors };
  })
  .handler(async ({ data }) => {
    if (data.kind === "invalid") {
      return {
        ok: false as const,
        reason: "validation" as const,
        fieldErrors: data.fieldErrors,
        message:
          data.fieldErrors.fullName ||
          data.fieldErrors.email ||
          data.fieldErrors.whatsapp ||
          "Verifique os dados informados.",
      };
    }
    const input = data.data;
    try {
      const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
      const { issueSessionCookie } = await import("./vip-session.server");

      // Duplicidade por e-mail (case-insensitive) → login automático na área VIP.
      const { data: existing, error: lookupErr } = await supabaseAdmin
        .from("vip_members")
        .select("id, member_number, status")
        .ilike("email", input.email)
        .maybeSingle();
      if (lookupErr) {
        console.error("[vip] lookup failed", lookupErr);
        return {
          ok: false as const,
          reason: "db_error" as const,
          message: "Serviço temporariamente indisponível. Tente novamente em instantes.",
        };
      }
      if (existing && existing.status === "active") {
        try {
          issueSessionCookie(existing.id);
        } catch (sessionErr) {
          console.error("[vip] issueSessionCookie failed for existing member", sessionErr);
        }
        console.log(`[vip] existing member logged in: #${existing.member_number}`);
        return {
          ok: true as const,
          alreadyMember: true as const,
          member: {
            id: existing.id,
            memberNumber: existing.member_number,
            fullName: input.fullName,
            email: input.email,
            whatsapp: input.whatsapp,
            unlockedAt: null,
            accessCode: null,
          },
        };
      }
      if (existing) {
        return {
          ok: false as const,
          reason: "blocked" as const,
          message: "Conta indisponível. Entre em contato com o suporte.",
        };
      }

      const accessCode = generateAccessCode();

      const { data: inserted, error } = await supabaseAdmin
        .from("vip_members")
        .insert({
          full_name: input.fullName,
          email: input.email,
          whatsapp: input.whatsapp,
          access_code: accessCode,
        })
        .select("id, member_number, full_name, email, whatsapp, unlocked_at, access_code")
        .single();

      if (error || !inserted) {
        console.error("[vip] insert failed", error);
        // 23505 = unique_violation (corrida de duplicidade): tenta login automático.
        if (error && (error as { code?: string }).code === "23505") {
          const { data: raced } = await supabaseAdmin
            .from("vip_members")
            .select("id, member_number, status")
            .ilike("email", input.email)
            .maybeSingle();
          if (raced && raced.status === "active") {
            try {
              issueSessionCookie(raced.id);
            } catch (e) {
              console.error("[vip] issueSessionCookie (race) failed", e);
            }
            return {
              ok: true as const,
              alreadyMember: true as const,
              member: {
                id: raced.id,
                memberNumber: raced.member_number,
                fullName: input.fullName,
                email: input.email,
                whatsapp: input.whatsapp,
                unlockedAt: null,
                accessCode: null,
              },
            };
          }
        }
        return {
          ok: false as const,
          reason: "server_error" as const,
          message: "Não foi possível concluir o cadastro agora. Tente novamente em instantes.",
        };
      }

      // Sessão emitida antes de eventos: se a persistência de evento falhar,
      // o cadastro segue válido e o usuário entra na área VIP normalmente.
      try {
        issueSessionCookie(inserted.id);
      } catch (sessionErr) {
        console.error("[vip] issueSessionCookie failed (non-fatal)", sessionErr);
      }

      try {
        await supabaseAdmin.from("vip_events").insert({
          member_id: inserted.id,
          type: "signup",
          payload: { via: "simple" },
        });
      } catch (evtErr) {
        console.error("[vip] signup event insert failed (non-fatal)", evtErr);
      }

      // Integração com n8n temporariamente desativada para o lançamento.
      // O cadastro é gravado exclusivamente no Supabase.

      return {
        ok: true as const,
        member: {
          id: inserted.id,
          memberNumber: inserted.member_number,
          fullName: inserted.full_name,
          email: inserted.email,
          whatsapp: inserted.whatsapp,
          unlockedAt: inserted.unlocked_at,
          accessCode: inserted.access_code,
        },
      };
    } catch (err) {
      console.error("[vip] register unexpected error", err);
      return {
        ok: false as const,
        reason: "server_error" as const,
        message: "Erro interno. Tente novamente em instantes.",
      };
    }
  });

// ------------------------------------------------------------------
// loginVipMemberSimple — por e-mail + código
// ------------------------------------------------------------------
export const loginVipMemberSimple = createServerFn({ method: "POST" })
  .validator((data: unknown) => loginSimpleSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { issueSessionCookie } = await import("./vip-session.server");

    const { data: member } = await supabaseAdmin
      .from("vip_members")
      .select("id, access_code, status")
      .ilike("email", data.email)
      .maybeSingle();

    if (!member || member.access_code !== data.accessCode || member.status !== "active") {
      return { ok: false as const, message: "Dados inválidos." };
    }

    issueSessionCookie(member.id);
    return { ok: true as const };
  });

// ------------------------------------------------------------------
// logoutVipMember
// ------------------------------------------------------------------
export const logoutVipMember = createServerFn({ method: "POST" }).handler(async () => {
  const { clearSessionCookie } = await import("./vip-session.server");
  clearSessionCookie();
  return { ok: true as const };
});

// ------------------------------------------------------------------
// getMyVipMember — cartão + convites + benefícios elegíveis
// ------------------------------------------------------------------
export const getMyVipMember = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { readSessionCookie } = await import("./vip-session.server");

  const memberId = readSessionCookie();
  if (!memberId) return { ok: false as const };

  const { data: member } = await supabaseAdmin
    .from("vip_members")
    .select("id, member_number, full_name, instagram_handle, city, unlocked_at, status")
    .eq("id", memberId)
    .maybeSingle();

  if (!member || member.status !== "active") return { ok: false as const };

  const [{ data: invites }, { data: benefits }, { data: followEvent }, { data: shareEvent }] =
    await Promise.all([
      supabaseAdmin
        .from("vip_invites")
        .select("id, status, created_at, confirmed_at")
        .eq("sponsor_id", memberId)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("vip_benefits")
        .select("id, title, description, type, code, min_invites, ends_at")
        .eq("active", true)
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("vip_events")
        .select("created_at")
        .eq("member_id", memberId)
        .eq("type", "instagram_follow")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabaseAdmin
        .from("vip_events")
        .select("created_at")
        .eq("member_id", memberId)
        .eq("type", "invite_share")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const confirmed = (invites ?? []).filter((i) => i.status === "confirmed").length;
  const pending = (invites ?? []).filter((i) => i.status === "pending").length;

  const allBenefits = (benefits ?? []).map((b) => {
    const minInvites = b.min_invites ?? 0;
    const unlocked = minInvites <= confirmed;
    // Substitui {MEMBER_ID} no cupom (permite cupom dinâmico por membro).
    const memberIdPad = String(member.member_number).padStart(4, "0");
    const code = b.code ? b.code.replace(/\{MEMBER_ID\}/gi, memberIdPad) : null;
    return {
      id: b.id,
      title: b.title,
      description: b.description,
      type: b.type,
      code: unlocked ? code : null,
      rawCode: code,
      minInvites,
      unlocked,
      progress: minInvites === 0 ? 1 : Math.min(1, confirmed / minInvites),
      remaining: Math.max(0, minInvites - confirmed),
      endsAt: b.ends_at,
    };
  });

  const eligibleBenefits = allBenefits.filter((b) => b.unlocked);

  const memberIdPad = String(member.member_number).padStart(4, "0");
  const firstNameSlug =
    (member.full_name || "MEMBRO")
      .trim()
      .split(/\s+/)[0]
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z]/g, "")
      .toUpperCase()
      .slice(0, 12) || "MEMBRO";
  const couponCode = `GEA-${firstNameSlug}-${memberIdPad}`;
  const referralCode = `GEA${memberIdPad}`;

  return {
    ok: true as const,
    member: {
      id: member.id,
      memberNumber: member.member_number,
      fullName: member.full_name,
      instagram: member.instagram_handle,
      city: member.city,
      unlockedAt: member.unlocked_at,
      status: member.status,
      couponCode,
      referralCode,
    },
    invites: {
      confirmed,
      pending,
      total: (invites ?? []).length,
      list: invites ?? [],
    },
    benefits: eligibleBenefits,
    allBenefits,
    instagramFollowedAt: followEvent?.created_at ?? null,
    instagramConfirmed: Boolean(followEvent),
    inviteSharedAt: shareEvent?.created_at ?? null,
    cardUnlocked: Boolean(followEvent && shareEvent),
  };
});

// ------------------------------------------------------------------
// confirmInstagramFollow — registra que o membro voltou do Instagram
// ------------------------------------------------------------------
export const confirmInstagramFollow = createServerFn({ method: "POST" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { readSessionCookie } = await import("./vip-session.server");

  const memberId = readSessionCookie();
  if (!memberId) return { ok: false as const };

  // Verifica se já existe (idempotente)
  const { data: existing } = await supabaseAdmin
    .from("vip_events")
    .select("id, created_at")
    .eq("member_id", memberId)
    .eq("type", "instagram_follow")
    .limit(1)
    .maybeSingle();

  if (existing) return { ok: true as const, confirmedAt: existing.created_at, already: true };

  const { data: inserted } = await supabaseAdmin
    .from("vip_events")
    .insert({ member_id: memberId, type: "instagram_follow", payload: { source: "vip_panel" } })
    .select("created_at")
    .single();

  return {
    ok: true as const,
    confirmedAt: inserted?.created_at ?? new Date().toISOString(),
    already: false,
  };
});

// ------------------------------------------------------------------
// logInviteShare — registra clique nos botões de compartilhamento do convite
// (whatsapp, copy_link, qr_code_generate, qr_code_download)
// ------------------------------------------------------------------
const inviteShareChannels = ["whatsapp", "copy_link", "qr_generate", "qr_download"] as const;

export const logInviteShare = createServerFn({ method: "POST" })
  .validator((data: { channel: (typeof inviteShareChannels)[number] }) =>
    z.object({ channel: z.enum(inviteShareChannels) }).parse(data),
  )
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { readSessionCookie } = await import("./vip-session.server");

    const memberId = readSessionCookie();
    if (!memberId) return { ok: false as const };

    await supabaseAdmin.from("vip_events").insert({
      member_id: memberId,
      type: "invite_share",
      payload: { channel: data.channel },
    });

    return { ok: true as const };
  });
