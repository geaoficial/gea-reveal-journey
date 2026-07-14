import { motion } from "motion/react";
import lifestyle02 from "@/assets/gea-lifestyle-02.jpeg.asset.json";
import watchEditorial from "@/assets/gea-watch-editorial.jpg.asset.json";

type Frame = {
  label: string;
  image: string;
  quote?: string;
  zoom?: number;
  position?: string;
};

const frames: Frame[] = [
  { label: "Relógio ao pôr do sol — silhueta preta na estrada", image: lifestyle02.url, quote: "Algumas escolhas dizem tudo." },
  {
    label: "Smartwatch editorial — composição planetária ao pôr do sol",
    image: watchEditorial.url,
    quote: "O tempo revela.",
  },
];



export function Lifestyle() {
  return (
    <section className="relative bg-gea-black">
      {frames.map((frame, i) => (
        <div key={i}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 1.4 }}
            className="relative h-[90dvh] w-full overflow-hidden"
          >
            <motion.div
              initial={{ scale: 1.15 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              className="h-full w-full"
            >
              <img
                src={frame.image}
                alt={frame.label}
                loading="lazy"
                className="h-full w-full object-cover"
                style={{
                  transform: frame.zoom ? `scale(${frame.zoom})` : undefined,
                  transformOrigin: frame.position ?? "center center",
                  objectPosition: frame.position ?? "center center",
                }}
              />


            </motion.div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
          </motion.div>

          {frame.quote && (
            <div className="flex min-h-[60vh] items-center justify-center px-6 py-32">
              <motion.p
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="max-w-3xl text-center text-[clamp(2rem,5vw,4rem)] leading-[1.15] text-gea-cream font-display italic"
              >
                {frame.quote}
              </motion.p>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
