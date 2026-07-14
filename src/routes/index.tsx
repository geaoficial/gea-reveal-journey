import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/gea/Hero";
import { Manifesto } from "@/components/gea/Manifesto";
import { Lifestyle } from "@/components/gea/Lifestyle";
import { InstagramSection } from "@/components/gea/InstagramSection";
import { HiddenChapter } from "@/components/gea/HiddenChapter";
import { CinematicControls } from "@/components/gea/CinematicControls";
import { CinematicTrailer } from "@/components/gea/CinematicTrailer";
import { ShareDock } from "@/components/gea/ShareDock";
import { VipUnlockOverlay } from "@/components/gea/VipUnlockOverlay";
import { VipArea } from "@/components/gea/VipArea";

import ogAsset from "@/assets/gea-og-cover.jpg.asset.json";
import { heroImage } from "@/lib/responsive-image";
import { getRequestOrigin } from "@/lib/origin.functions";

export const Route = createFileRoute("/")({
  loader: async () => {
    const origin = await getRequestOrigin();
    return { origin };
  },
  head: ({ loaderData }) => {
    const origin = loaderData?.origin ?? "";
    const ogImage = `${origin}${ogAsset.url}`;
    const pageUrl = `${origin}/`;
    return {
      meta: [
        { title: "GEA — O tempo revela." },
        {
          name: "description",
          content:
            "GEA. Mais do que um relógio. Uma identidade. Uma marca cinematográfica para quem valoriza tempo, presença e evolução.",
        },
        { property: "og:title", content: "GEA — O tempo revela." },
        {
          property: "og:description",
          content: "Mais do que um relógio. Uma identidade.",
        },
        { property: "og:type", content: "website" },
        { property: "og:url", content: pageUrl || "/" },
        ...(origin
          ? [
              { property: "og:image", content: ogImage },
              { property: "og:image:width", content: "1200" },
              { property: "og:image:height", content: "630" },
              { property: "twitter:image", content: ogImage },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "GEA — O tempo revela." },
        {
          name: "twitter:description",
          content: "Mais do que um relógio. Uma identidade.",
        },
      ],
      links: [
        { rel: "canonical", href: "/" },
        {
          rel: "preload",
          as: "image",
          type: "image/avif",
          href: heroImage.preloadHref,
          imagesrcset: heroImage.avif,
          imagesizes: heroImage.sizes,
          fetchpriority: "high",
        },
      ],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "GEA",
            slogan: "O tempo revela.",
            description: "Mais do que um relógio. Uma identidade.",
            url: pageUrl || undefined,
            logo: origin ? ogImage : undefined,
            sameAs: ["https://instagram.com/geastoree"],
          }),
        },
      ],
    };
  },
  component: Index,
});

function Index() {
  return (
    <main className="bg-gea-black text-gea-cream">
      <SilentBoundary><Hero /></SilentBoundary>
      <SilentBoundary><Manifesto /></SilentBoundary>
      <SilentBoundary><Lifestyle /></SilentBoundary>
      <SilentBoundary><InstagramSection /></SilentBoundary>
      <SilentBoundary><VipArea /></SilentBoundary>
      <SilentBoundary><HiddenChapter /></SilentBoundary>
      <SilentBoundary><CinematicFx /></SilentBoundary>
      <SilentBoundary><ShareDock /></SilentBoundary>
      <SilentBoundary><VipUnlockOverlay /></SilentBoundary>
    </main>
  );
}

function CinematicFx() {
  const { allowHeavyFx, reducedMotion } = useDeviceCapability();
  return (
    <>
      {allowHeavyFx && <CinematicTrailer />}
      {/* Global cinematic grain overlay, tied to --grain-opacity */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 mix-blend-overlay"
        style={{
          opacity: allowHeavyFx ? "var(--grain-opacity)" : 0,
          backgroundImage: allowHeavyFx
            ? "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")"
            : "none",
          transition: "opacity 400ms ease",
        }}
      />
      {/* Global vignette, tied to --vignette-opacity */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,var(--vignette-opacity)) 100%)",
          transition: "background 400ms ease",
        }}
      />
      {!reducedMotion && <CinematicControls />}
    </>
  );
}
