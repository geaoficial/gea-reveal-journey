import { motion } from "motion/react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getInstagramFeed } from "@/lib/instagram.functions";
import ig1 from "@/assets/gea-ig-1.jpg.asset.json";
import ig2 from "@/assets/gea-ig-2.jpg.asset.json";
import ig3 from "@/assets/gea-ig-3.jpg.asset.json";
import ig4 from "@/assets/gea-ig-4.jpg.asset.json";
import ig5 from "@/assets/gea-ig-5.jpg.asset.json";
import ig6 from "@/assets/gea-ig-6.jpg.asset.json";
import ig7 from "@/assets/gea-ig-7.jpg.asset.json";
import ig8 from "@/assets/gea-ig-8.jpg.asset.json";
import ig9 from "@/assets/gea-ig-9.jpg.asset.json";

const IG_URL = "https://instagram.com/geastoree";

const fallbackTiles: Array<{ url: string; label: string }> = [
  { url: ig1.url, label: "SUV branco ao pôr do sol" },
  { url: ig2.url, label: "Relógio prata — luz dourada" },
  { url: ig3.url, label: "Silhueta ao pôr do sol" },
  { url: ig4.url, label: "Estrada até o horizonte" },
  { url: ig5.url, label: "Detalhe preto — relógio" },
  { url: ig6.url, label: "Mão ao volante — sunset" },
  { url: ig7.url, label: "SUV branco — perfil" },
  { url: ig8.url, label: "Flare do sol na estrada" },
  { url: ig9.url, label: "Ajustando o relógio" },
];



export function InstagramSection() {
  const fetchFeed = useServerFn(getInstagramFeed);
  const { data } = useQuery({
    queryKey: ["instagram-feed"],
    queryFn: () => fetchFeed(),
    staleTime: 30 * 60 * 1000,
    retry: 1,
  });

  const livePosts = data?.posts ?? [];
  const hasLive = livePosts.length > 0;

  return (
    <section id="instagram" className="relative bg-gea-black py-32 md:py-48">
      <div className="mx-auto max-w-6xl px-6">
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="mb-8 block text-center text-[0.65rem] uppercase tracking-[0.5em] text-gea-sunset/70"
        >
          @geastoree
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-3xl text-center text-[clamp(2rem,5vw,3.6rem)] leading-[1.1] text-gea-cream font-display italic"
        >
          A história da GEA está apenas começando.
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mx-auto mt-6 max-w-xl text-center text-sm text-gea-cream/60"
        >
          Os bastidores, lançamentos e novidades aparecem primeiro no Instagram.
        </motion.p>

        <div className="mt-16 grid grid-cols-3 gap-1 md:gap-2">
          {hasLive
            ? livePosts.map((post, i) => (
                <motion.a
                  key={post.postUrl}
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="group relative block aspect-square overflow-hidden bg-gea-black/60"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.caption ?? `Post ${i + 1} do Instagram @geastoree`}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover grayscale-[0.15] transition-all duration-[1200ms] ease-out group-hover:scale-105 group-hover:grayscale-0"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />
                </motion.a>
              ))
            : fallbackTiles.map((t, i) => (
                <motion.a
                  key={i}
                  href={IG_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.8, delay: i * 0.05 }}
                  className="group relative block overflow-hidden"
                >
                  <div className="transition-transform duration-[1200ms] ease-out group-hover:scale-105">
                    <Placeholder label={t.label} tint={t.tint} aspect="1 / 1" className="w-full" />
                  </div>
                  <div className="pointer-events-none absolute inset-0 bg-black/0 transition-colors duration-500 group-hover:bg-black/30" />
                </motion.a>
              ))}
        </div>


        <div className="mt-20 flex flex-col items-center">
          <motion.a
            href={IG_URL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            whileHover={{ scale: 1.02 }}
            className="group relative inline-flex items-center gap-4 bg-gea-cream px-10 py-5 text-[0.72rem] uppercase tracking-[0.36em] text-gea-black transition-colors duration-500 hover:bg-gea-sunset"
          >
            Seguir @geastoree
            <span className="inline-block transition-transform duration-500 group-hover:translate-x-1">→</span>
          </motion.a>

          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1, delay: 0.4 }}
            className="mt-8 max-w-md text-center text-xs italic text-gea-cream/45 font-display"
          >
            Junte-se aos primeiros que estão acompanhando essa jornada.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
