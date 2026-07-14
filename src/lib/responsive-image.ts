// JPEG fallback (universal support)
import hero640j from "@/assets/responsive/hero-640.jpg.asset.json";
import hero1280j from "@/assets/responsive/hero-1280.jpg.asset.json";
import hero1920j from "@/assets/responsive/hero-1920.jpg.asset.json";
import life640j from "@/assets/responsive/life-640.jpg.asset.json";
import life1280j from "@/assets/responsive/life-1280.jpg.asset.json";
import life1920j from "@/assets/responsive/life-1920.jpg.asset.json";
import mystery640j from "@/assets/responsive/mystery-640.jpg.asset.json";
import mystery1280j from "@/assets/responsive/mystery-1280.jpg.asset.json";
import mystery1920j from "@/assets/responsive/mystery-1920.jpg.asset.json";
// WebP (broad modern support)
import hero640w from "@/assets/responsive/hero-640.webp.asset.json";
import hero1280w from "@/assets/responsive/hero-1280.webp.asset.json";
import hero1920w from "@/assets/responsive/hero-1920.webp.asset.json";
import life640w from "@/assets/responsive/life-640.webp.asset.json";
import life1280w from "@/assets/responsive/life-1280.webp.asset.json";
import life1920w from "@/assets/responsive/life-1920.webp.asset.json";
import mystery640w from "@/assets/responsive/mystery-640.webp.asset.json";
import mystery1280w from "@/assets/responsive/mystery-1280.webp.asset.json";
import mystery1920w from "@/assets/responsive/mystery-1920.webp.asset.json";
// AVIF (best compression, newest browsers)
import hero640a from "@/assets/responsive/hero-640.avif.asset.json";
import hero1280a from "@/assets/responsive/hero-1280.avif.asset.json";
import hero1920a from "@/assets/responsive/hero-1920.avif.asset.json";
import life640a from "@/assets/responsive/life-640.avif.asset.json";
import life1280a from "@/assets/responsive/life-1280.avif.asset.json";
import life1920a from "@/assets/responsive/life-1920.avif.asset.json";
import mystery640a from "@/assets/responsive/mystery-640.avif.asset.json";
import mystery1280a from "@/assets/responsive/mystery-1280.avif.asset.json";
import mystery1920a from "@/assets/responsive/mystery-1920.avif.asset.json";

const WIDTHS = [640, 1280, 1920];

const build = (v: { url: string }[]) =>
  v.map((a, i) => `${a.url} ${WIDTHS[i]}w`).join(", ");

/** Art direction — full-bleed on every breakpoint; browser matches to DPR. */
export const FULL_BLEED_SIZES = "100vw";

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
  /** Highest-resolution JPEG (used as safe preload href). */
  fallback: string;
};

export const heroImage: ResponsiveImage = {
  src: hero1280j.url,
  fallback: hero1920j.url,
  srcSet: build([hero640j, hero1280j, hero1920j]),
  webp: build([hero640w, hero1280w, hero1920w]),
  avif: build([hero640a, hero1280a, hero1920a]),
  sizes: FULL_BLEED_SIZES,
};

export const lifestyleImage: ResponsiveImage = {
  src: life1280j.url,
  fallback: life1920j.url,
  srcSet: build([life640j, life1280j, life1920j]),
  webp: build([life640w, life1280w, life1920w]),
  avif: build([life640a, life1280a, life1920a]),
  sizes: FULL_BLEED_SIZES,
};

export const mysteryImage: ResponsiveImage = {
  src: mystery1280j.url,
  fallback: mystery1920j.url,
  srcSet: build([mystery640j, mystery1280j, mystery1920j]),
  webp: build([mystery640w, mystery1280w, mystery1920w]),
  avif: build([mystery640a, mystery1280a, mystery1920a]),
  sizes: FULL_BLEED_SIZES,
};
