import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Returns the absolute origin (protocol + host) of the current SSR request.
 * Used to build absolute og:image / twitter:image URLs — social crawlers
 * require absolute HTTPS URLs, so a relative "/__l5e/..." path would be
 * ignored.
 */
export const getRequestOrigin = createServerFn({ method: "GET" }).handler(() => {
  const req = getRequest();
  const proto = req.headers.get("x-forwarded-proto") ?? "https";
  const host = req.headers.get("host") ?? "";
  return `${proto}://${host}`;
});
