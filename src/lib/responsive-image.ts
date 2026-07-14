import hero640 from "@/assets/responsive/hero-640.jpg.asset.json";
import hero1280 from "@/assets/responsive/hero-1280.jpg.asset.json";
import hero1920 from "@/assets/responsive/hero-1920.jpg.asset.json";
import life640 from "@/assets/responsive/life-640.jpg.asset.json";
import life1280 from "@/assets/responsive/life-1280.jpg.asset.json";
import life1920 from "@/assets/responsive/life-1920.jpg.asset.json";
import mystery640 from "@/assets/responsive/mystery-640.jpg.asset.json";
import mystery1280 from "@/assets/responsive/mystery-1280.jpg.asset.json";
import mystery1920 from "@/assets/responsive/mystery-1920.jpg.asset.json";

const build = (v: { url: string }[], widths: number[]) =>
  v.map((a, i) => `${a.url} ${widths[i]}w`).join(", ");

/**
 * Full-bleed art direction: image covers the entire viewport width on every
 * breakpoint, so the browser picks the variant closest to `100vw` * DPR.
 * Kept as a single string so it can also be handed to <link rel="preload">.
 */
export const FULL_BLEED_SIZES = "(max-width: 640px) 100vw, (max-width: 1280px) 100vw, 1920px";

const WIDTHS = [640, 1280, 1920];

export const heroImage = {
  src: hero1280.url,
  fallback: hero1920.url,
  srcSet: build([hero640, hero1280, hero1920], WIDTHS),
  sizes: FULL_BLEED_SIZES,
};

export const lifestyleImage = {
  src: life1280.url,
  fallback: life1920.url,
  srcSet: build([life640, life1280, life1920], WIDTHS),
  sizes: FULL_BLEED_SIZES,
};

export const mysteryImage = {
  src: mystery1280.url,
  fallback: mystery1920.url,
  srcSet: build([mystery640, mystery1280, mystery1920], WIDTHS),
  sizes: FULL_BLEED_SIZES,
};
