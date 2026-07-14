import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/gea/Hero";
import { Manifesto } from "@/components/gea/Manifesto";
import { Lifestyle } from "@/components/gea/Lifestyle";
import { InstagramSection } from "@/components/gea/InstagramSection";
import { FinalCTA } from "@/components/gea/FinalCTA";
import { CinematicControls } from "@/components/gea/CinematicControls";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <main className="bg-gea-black text-gea-cream">
      <Hero />
      <Manifesto />
      <Lifestyle />
      <InstagramSection />
      <FinalCTA />
      {/* Global cinematic grain overlay, tied to --grain-opacity */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-40 mix-blend-overlay"
        style={{
          opacity: "var(--grain-opacity)",
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
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
      <CinematicControls />
    </main>
  );
}
