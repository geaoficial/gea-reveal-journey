/** Server function que grava o cookie de padrinho ao abrir /invite/:memberNumber */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

export const trackInviteVisit = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ memberNumber: z.number().int().positive() }).parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { setInviteSponsorCookie } = await import("./vip-session.server");

    const { data: sponsor } = await supabaseAdmin
      .from("vip_members")
      .select("id, member_number, full_name, instagram_handle")
      .eq("member_number", data.memberNumber)
      .eq("status", "active")
      .maybeSingle();

    if (!sponsor) return { ok: false as const };

    setInviteSponsorCookie(sponsor.member_number);
    return {
      ok: true as const,
      sponsor: {
        memberNumber: sponsor.member_number,
        fullName: sponsor.full_name,
        instagram: sponsor.instagram_handle,
      },
    };
  });
