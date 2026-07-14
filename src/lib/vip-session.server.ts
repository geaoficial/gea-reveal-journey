// Server-only: HMAC cookie helpers for the VIP member session.
// Never import this from route files or components — the "server" suffix
// keeps it out of the client bundle.
import { createHmac, timingSafeEqual } from "node:crypto";
import { getCookie, setCookie, deleteCookie } from "@tanstack/react-start/server";

const COOKIE_NAME = "gea_vip_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30; // 30 dias

function secret(): string {
  const s = process.env.VIP_SESSION_SECRET;
  if (!s) throw new Error("VIP_SESSION_SECRET is not configured");
  return s;
}

function sign(payload: string): string {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}

/** Cria um cookie HttpOnly assinado com o memberId. */
export function issueSessionCookie(memberId: string) {
  const expires = Math.floor(Date.now() / 1000) + MAX_AGE_SEC;
  const payload = `${memberId}.${expires}`;
  const signature = sign(payload);
  setCookie(COOKIE_NAME, `${payload}.${signature}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: MAX_AGE_SEC,
  });
}

/** Lê e valida o cookie. Retorna o memberId ou null. */
export function readSessionCookie(): string | null {
  const raw = getCookie(COOKIE_NAME);
  if (!raw) return null;
  const parts = raw.split(".");
  if (parts.length !== 3) return null;
  const [memberId, expiresStr, signature] = parts;
  const expires = Number(expiresStr);
  if (!Number.isFinite(expires) || Date.now() / 1000 > expires) return null;
  const expected = sign(`${memberId}.${expiresStr}`);
  try {
    const a = Buffer.from(signature, "hex");
    const b = Buffer.from(expected, "hex");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return memberId;
}

export function clearSessionCookie() {
  deleteCookie(COOKIE_NAME, { path: "/" });
}

// Cookie de rastreamento de padrinho de convite
const INVITE_COOKIE = "gea_invite_sponsor";
const INVITE_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

export function setInviteSponsorCookie(memberNumber: number) {
  setCookie(INVITE_COOKIE, String(memberNumber), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: INVITE_MAX_AGE,
  });
}

export function readInviteSponsorCookie(): number | null {
  const raw = getCookie(INVITE_COOKIE);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function clearInviteSponsorCookie() {
  deleteCookie(INVITE_COOKIE, { path: "/" });
}
