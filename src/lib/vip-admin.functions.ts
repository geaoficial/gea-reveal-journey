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
        "id, status, created_at, confirmed_at, sponsor:vip_members!vip_invites_sponsor_id_fkey(id, member_number, full_name, instagram_handle), invitee:vip_members!vip_invites_invitee_id_fkey(id, member_number, full_name, instagram_handle)",
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
    const { error } = await supabaseAdmin
      .from("vip_invites")
      .update({
        status: data.status,
        confirmed_at: data.status === "confirmed" ? new Date().toISOString() : null,
      })
      .eq("id", data.inviteId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ------------------------------------------------------------------
// Estatísticas de compartilhamento de convite (vip_events)
// Agrupa por canal e por membro, com filtro por período (em dias).
// ------------------------------------------------------------------
export const getInviteShareStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z
      .object({
        days: z.number().int().min(1).max(365).default(30),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const since = new Date(Date.now() - data.days * 24 * 60 * 60 * 1000).toISOString();

    const { data: rows, error } = await supabaseAdmin
      .from("vip_events")
      .select("id, member_id, payload, created_at")
      .eq("type", "invite_share")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);
    if (error) throw new Error(error.message);

    const events = rows ?? [];

    // Agrupa por canal
    const byChannel = new Map<string, number>();
    // Agrupa por membro
    const byMember = new Map<
      string,
      { total: number; whatsapp: number; copy_link: number; qr_generate: number; qr_download: number; last: string }
    >();

    for (const e of events) {
      const channel = ((e.payload as { channel?: string } | null)?.channel ?? "unknown") as string;
      byChannel.set(channel, (byChannel.get(channel) ?? 0) + 1);

      if (e.member_id) {
        const cur = byMember.get(e.member_id) ?? {
          total: 0,
          whatsapp: 0,
          copy_link: 0,
          qr_generate: 0,
          qr_download: 0,
          last: e.created_at,
        };
        cur.total += 1;
        if (channel === "whatsapp") cur.whatsapp += 1;
        else if (channel === "copy_link") cur.copy_link += 1;
        else if (channel === "qr_generate") cur.qr_generate += 1;
        else if (channel === "qr_download") cur.qr_download += 1;
        if (new Date(e.created_at) > new Date(cur.last)) cur.last = e.created_at;
        byMember.set(e.member_id, cur);
      }
    }

    // Hidrata nomes dos membros
    const memberIds = [...byMember.keys()];
    let membersMap = new Map<string, { member_number: number; full_name: string; instagram_handle: string }>();
    if (memberIds.length > 0) {
      const { data: members } = await supabaseAdmin
        .from("vip_members")
        .select("id, member_number, full_name, instagram_handle")
        .in("id", memberIds);
      for (const m of members ?? []) {
        membersMap.set(m.id, {
          member_number: m.member_number,
          full_name: m.full_name,
          instagram_handle: m.instagram_handle,
        });
      }
    }

    const channels = [...byChannel.entries()]
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count);

    const members = [...byMember.entries()]
      .map(([memberId, stats]) => ({
        memberId,
        member_number: membersMap.get(memberId)?.member_number ?? null,
        full_name: membersMap.get(memberId)?.full_name ?? "—",
        instagram_handle: membersMap.get(memberId)?.instagram_handle ?? "",
        ...stats,
      }))
      .sort((a, b) => b.total - a.total);

    return {
      total: events.length,
      periodDays: data.days,
      channels,
      members,
    };
  });
