// JPEG fallback (universal support)
import hero640j from "@/assets/responsive/hero-640.jpg.asset.json";
import hero1280j from "@/assets/responsive/hero-1280.jpg.asset.json";
import hero1920j from "@/assets/responsive/hero-1920.jpg.asset.json";
import hero2528j from "@/assets/responsive/hero-2528.jpg.asset.json";
import life640j from "@/assets/responsive/life-640.jpg.asset.json";
import life1280j from "@/assets/responsive/life-1280.jpg.asset.json";
import life1920j from "@/assets/responsive/life-1920.jpg.asset.json";
import life2528j from "@/assets/responsive/life-2528.jpg.asset.json";
import mystery640j from "@/assets/responsive/mystery-640.jpg.asset.json";
import mystery1280j from "@/assets/responsive/mystery-1280.jpg.asset.json";
import mystery1920j from "@/assets/responsive/mystery-1920.jpg.asset.json";
import mystery2048j from "@/assets/responsive/mystery-2048.jpg.asset.json";
// WebP (broad modern support)
import hero640w from "@/assets/responsive/hero-640.webp.asset.json";
import hero1280w from "@/assets/responsive/hero-1280.webp.asset.json";
import hero1920w from "@/assets/responsive/hero-1920.webp.asset.json";
import hero2528w from "@/assets/responsive/hero-2528.webp.asset.json";
import life640w from "@/assets/responsive/life-640.webp.asset.json";
import life1280w from "@/assets/responsive/life-1280.webp.asset.json";
import life1920w from "@/assets/responsive/life-1920.webp.asset.json";
import life2528w from "@/assets/responsive/life-2528.webp.asset.json";
import mystery640w from "@/assets/responsive/mystery-640.webp.asset.json";
import mystery1280w from "@/assets/responsive/mystery-1280.webp.asset.json";
import mystery1920w from "@/assets/responsive/mystery-1920.webp.asset.json";
import mystery2048w from "@/assets/responsive/mystery-2048.webp.asset.json";
// AVIF (best compression, newest browsers)
import hero640a from "@/assets/responsive/hero-640.avif.asset.json";
import hero1280a from "@/assets/responsive/hero-1280.avif.asset.json";
import hero1920a from "@/assets/responsive/hero-1920.avif.asset.json";
import hero2528a from "@/assets/responsive/hero-2528.avif.asset.json";
import life640a from "@/assets/responsive/life-640.avif.asset.json";
import life1280a from "@/assets/responsive/life-1280.avif.asset.json";
import life1920a from "@/assets/responsive/life-1920.avif.asset.json";
import life2528a from "@/assets/responsive/life-2528.avif.asset.json";
import mystery640a from "@/assets/responsive/mystery-640.avif.asset.json";
import mystery1280a from "@/assets/responsive/mystery-1280.avif.asset.json";
import mystery1920a from "@/assets/responsive/mystery-1920.avif.asset.json";
import mystery2048a from "@/assets/responsive/mystery-2048.avif.asset.json";

const build = (v: { asset: { url: string }; width: number }[]) =>
  v.map(({ asset, width }) => `${asset.url} ${width}w`).join(", ");

/** Art direction — full-bleed on every breakpoint; browser matches to DPR. */
export const FULL_BLEED_SIZES =
  "(orientation: portrait) 260vw, (max-aspect-ratio: 4/3) 180vw, 110vw";

export type ResponsiveImage = {
  /** JPEG fallback URL for <img src>. Universal support. */
  src: string;
  /** JPEG srcSet used as final <img> fallback. */
  srcSet: string;
  /** WebP srcSet — served via <source type="image/webp"> */
  webp: string;
  /** AVIF srcSet — served via <source type="image/avif"> */
  avif: string;
  /** Common sizes attribute for all sources. */
  sizes: string;
  /** Highest-resolution JPEG (used as safe preload href fallback). */
  fallback: string;
  /** Highest-resolution AVIF — matches the preload `type: image/avif`. */
  preloadHref: string;
  /**
   * CSS background used as a blur-up placeholder while the real image loads.
   * Built from dominant colors sampled from the asset itself so the tint
   * matches the final frame instead of showing a generic gradient.
   */
  placeholder: string;
};

/** Radial gradient tuned to the image's dominant palette (dark → mid → accent). */
const tint = (accent: string, mid: string, dark: string) =>
  `radial-gradient(ellipse at 50% 62%, ${accent} 0%, ${mid} 38%, ${dark} 78%, #000 100%)`;

export const heroImage: ResponsiveImage = {
  src: hero1280j.url,
  fallback: hero2528j.url,
  preloadHref: hero2528a.url,
  srcSet: build([
    { asset: hero640j, width: 640 },
    { asset: hero1280j, width: 1280 },
    { asset: hero1920j, width: 1920 },
    { asset: hero2528j, width: 2528 },
  ]),
  webp: build([
    { asset: hero640w, width: 640 },
    { asset: hero1280w, width: 1280 },
    { asset: hero1920w, width: 1920 },
    { asset: hero2528w, width: 2528 },
  ]),
  avif: build([
    { asset: hero640a, width: 640 },
    { asset: hero1280a, width: 1280 },
    { asset: hero1920a, width: 1920 },
    { asset: hero2528a, width: 2528 },
  ]),
  sizes: FULL_BLEED_SIZES,
  // sampled dominant palette — sunset road
  placeholder: tint("#e1a78b", "#9a7066", "#131a20"),
};

export const lifestyleImage: ResponsiveImage = {
  src: life1280j.url,
  fallback: life2528j.url,
  preloadHref: life2528a.url,
  srcSet: build([
    { asset: life640j, width: 640 },
    { asset: life1280j, width: 1280 },
    { asset: life1920j, width: 1920 },
    { asset: life2528j, width: 2528 },
  ]),
  webp: build([
    { asset: life640w, width: 640 },
    { asset: life1280w, width: 1280 },
    { asset: life1920w, width: 1920 },
    { asset: life2528w, width: 2528 },
  ]),
  avif: build([
    { asset: life640a, width: 640 },
    { asset: life1280a, width: 1280 },
    { asset: life1920a, width: 1920 },
    { asset: life2528a, width: 2528 },
  ]),
  sizes: FULL_BLEED_SIZES,
  // sampled dominant palette — silhouette dusk
  placeholder: tint("#ecd0af", "#6b8991", "#1d1d22"),
};

export const mysteryImage: ResponsiveImage = {
  src: mystery1280j.url,
  fallback: mystery2048j.url,
  preloadHref: mystery2048a.url,
  srcSet: build([
    { asset: mystery640j, width: 640 },
    { asset: mystery1280j, width: 1280 },
    { asset: mystery1920j, width: 1920 },
    { asset: mystery2048j, width: 2048 },
  ]),
  webp: build([
    { asset: mystery640w, width: 640 },
    { asset: mystery1280w, width: 1280 },
    { asset: mystery1920w, width: 1920 },
    { asset: mystery2048w, width: 2048 },
  ]),
  avif: build([
    { asset: mystery640a, width: 640 },
    { asset: mystery1280a, width: 1280 },
    { asset: mystery1920a, width: 1920 },
    { asset: mystery2048a, width: 2048 },
  ]),
  sizes: FULL_BLEED_SIZES,
  // sampled dominant palette — Life teaser, amber over dark teal
  placeholder: tint("#965425", "#264946", "#060f0e"),
};
