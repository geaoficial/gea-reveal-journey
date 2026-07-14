import { createServerFn } from "@tanstack/react-start";

export type InstagramPost = {
  imageUrl: string;
  postUrl: string;
  caption?: string;
};

// Server-side in-memory cache (per worker instance). Keeps requests low.
let cache: { posts: InstagramPost[]; at: number } | null = null;
const TTL_MS = 30 * 60 * 1000; // 30 min

const IG_HANDLE = "geastoree";
const PROFILE_URL = `https://www.instagram.com/${IG_HANDLE}/`;

export const getInstagramFeed = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ posts: InstagramPost[]; source: "live" | "cache" | "empty" }> => {
    if (cache && Date.now() - cache.at < TTL_MS) {
      return { posts: cache.posts, source: "cache" };
    }

    const apiKey = process.env.FIRECRAWL_API_KEY;
    if (!apiKey) {
      return { posts: [], source: "empty" };
    }

    try {
      const { default: Firecrawl } = await import("@mendable/firecrawl-js");
      const firecrawl = new Firecrawl({ apiKey });

      const result = await firecrawl.scrape(PROFILE_URL, {
        formats: [
          {
            type: "json",
            prompt:
              "Extract the 9 most recent public posts from this Instagram profile. For each post return: imageUrl (the thumbnail image), postUrl (the absolute https://www.instagram.com/p/... URL), and caption (short, optional).",
            schema: {
              type: "object",
              properties: {
                posts: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      imageUrl: { type: "string" },
                      postUrl: { type: "string" },
                      caption: { type: "string" },
                    },
                    required: ["imageUrl", "postUrl"],
                  },
                },
              },
              required: ["posts"],
            },
          },
        ],
        onlyMainContent: true,
        waitFor: 2500,
      });

      const raw =
        (result as { json?: { posts?: unknown } })?.json?.posts ??
        (result as { data?: { json?: { posts?: unknown } } })?.data?.json?.posts;

      const posts: InstagramPost[] = Array.isArray(raw)
        ? (raw as InstagramPost[])
            .filter(
              (p) =>
                p &&
                typeof p.imageUrl === "string" &&
                p.imageUrl.startsWith("http") &&
                typeof p.postUrl === "string" &&
                p.postUrl.includes("instagram.com"),
            )
            .slice(0, 9)
        : [];

      if (posts.length === 0) {
        return { posts: [], source: "empty" };
      }

      cache = { posts, at: Date.now() };
      return { posts, source: "live" };
    } catch (err) {
      console.error("[instagram] scrape failed", err);
      return { posts: [], source: "empty" };
    }
  },
);
