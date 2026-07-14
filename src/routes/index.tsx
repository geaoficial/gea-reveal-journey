import { createFileRoute } from "@tanstack/react-router";
import { Hero } from "@/components/gea/Hero";
import { Manifesto } from "@/components/gea/Manifesto";
import { Lifestyle } from "@/components/gea/Lifestyle";
import { InstagramSection } from "@/components/gea/InstagramSection";
import { FinalCTA } from "@/components/gea/FinalCTA";

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
    </main>
  );
}
