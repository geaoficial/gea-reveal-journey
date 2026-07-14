/**
 * Server functions do painel administrativo do Clube VIP GEA.
 * Todas exigem: usuário autenticado + role admin em user_roles.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function assertAdmin(userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden: admin only");
}

// ------------------------------------------------------------------
// Métricas do dashboard
// ------------------------------------------------------------------
export const getAdminMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const now = new Date();
    const start24h = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
    const start7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const [total, last24h, last7d, pending, confirmed] = await Promise.all([
      supabaseAdmin.from("vip_members").select("id", { count: "exact", head: true }),
      supabaseAdmin
        .from("vip_members")
        .select("id", { count: "exact", head: true })
        .gte("unlocked_at", start24h),
      supabaseAdmin
        .from("vip_members")
        .select("id", { count: "exact", head: true })
        .gte("unlocked_at", start7d),
      supabaseAdmin
        .from("vip_invites")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
      supabaseAdmin
        .from("vip_invites")
        .select("id", { count: "exact", head: true })
        .eq("status", "confirmed"),
    ]);

    return {
      totalMembers: total.count ?? 0,
      newLast24h: last24h.count ?? 0,
      newLast7d: last7d.count ?? 0,
      pendingInvites: pending.count ?? 0,
      confirmedInvites: confirmed.count ?? 0,
    };
  });

// ------------------------------------------------------------------
// Lista de membros (com busca)
// ------------------------------------------------------------------
export const listAdminMembers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ q: z.string().trim().max(60).optional() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    let query = supabaseAdmin
      .from("vip_members")
      .select("id, member_number, full_name, instagram_handle, city, status, unlocked_at")
      .order("member_number", { ascending: true })
      .limit(500);

    if (data.q && data.q.length > 0) {
      const like = `%${data.q.replace(/[%_]/g, "\\$&")}%`;
      query = query.or(
        `full_name.ilike.${like},instagram_handle.ilike.${like},city.ilike.${like}`,
      );
    }
    const { data: rows } = await query;
    return { members: rows ?? [] };
  });

// ------------------------------------------------------------------
// Update status do membro
// ------------------------------------------------------------------
export const setMemberStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ memberId: z.string().uuid(), status: z.enum(["active", "blocked"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("vip_members")
      .update({ status: data.status })
      .eq("id", data.memberId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------------------------------------------------------------
// Export CSV
// ------------------------------------------------------------------
export const exportMembersCsv = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows } = await supabaseAdmin
      .from("vip_members")
      .select("member_number, full_name, instagram_handle, city, status, unlocked_at")
      .order("member_number", { ascending: true });

    const header = "member_number;full_name;instagram_handle;city;status;unlocked_at";
    const escape = (v: unknown) =>
      v == null ? "" : String(v).replace(/[\r\n;]/g, " ").trim();
    const body = (rows ?? [])
      .map((r) =>
        [
          r.member_number,
          escape(r.full_name),
          "@" + r.instagram_handle,
          escape(r.city),
          r.status,
          r.unlocked_at,
        ].join(";"),
      )
      .join("\n");

    return { csv: `${header}\n${body}` };
  });

// ------------------------------------------------------------------
// Benefícios CRUD
// ------------------------------------------------------------------
export const listAdminBenefits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("vip_benefits")
      .select("*")
      .order("created_at", { ascending: false });
    return { benefits: data ?? [] };
  });

const benefitSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().max(2000).optional().nullable(),
  type: z.enum(["coupon", "invite", "offer", "raffle", "early_access", "gift"]),
  code: z.string().trim().max(60).optional().nullable(),
  active: z.boolean().default(true),
  min_invites: z.number().int().min(0).max(1000).default(0),
  starts_at: z.string().nullable().optional(),
  ends_at: z.string().nullable().optional(),
});

export const upsertBenefit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => benefitSchema.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (data.id) {
      const { error } = await supabaseAdmin
        .from("vip_benefits")
        .update({
          title: data.title,
          description: data.description ?? null,
          type: data.type,
          code: data.code ?? null,
          active: data.active,
          min_invites: data.min_invites,
          starts_at: data.starts_at ?? null,
          ends_at: data.ends_at ?? null,
        })
        .eq("id", data.id);
      if (error) throw new Error(error.message);
    } else {
      const { error } = await supabaseAdmin.from("vip_benefits").insert({
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        code: data.code ?? null,
        active: data.active,
        min_invites: data.min_invites,
        starts_at: data.starts_at ?? null,
        ends_at: data.ends_at ?? null,
      });
      if (error) throw new Error(error.message);
    }
    return { ok: true as const };
  });

export const deleteBenefit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ id: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("vip_benefits").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------------------------------------------------------------
// Convites (aprovar / rejeitar)
// ------------------------------------------------------------------
export const listAdminInvites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data } = await supabaseAdmin
      .from("vip_invites")
      .select(
        "id, status, created_at, confirmed_at, sponsor:sponsor_id(id, member_number, full_name, instagram_handle), invitee:invitee_id(id, member_number, full_name, instagram_handle)",
      )
      .order("created_at", { ascending: false })
      .limit(500);
    return { invites: data ?? [] };
  });

export const setInviteStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({ inviteId: z.string().uuid(), status: z.enum(["confirmed", "rejected"]) })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const patch: Record<string, unknown> = { status: data.status };
    if (data.status === "confirmed") patch.confirmed_at = new Date().toISOString();
    const { error } = await supabaseAdmin
      .from("vip_invites")
      .update(patch)
      .eq("id", data.inviteId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
