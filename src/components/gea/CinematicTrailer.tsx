import { useEffect, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";

const PHRASES = [
  "O tempo revela.",
  "Nem tudo precisa ser explicado.",
  "Algumas mudanças chegam em silêncio.",
  "Presença é percebida.",
  "Há algo sendo construído.",
  "O futuro pertence aos primeiros.",
  "O início nunca parece comum.",
  "Você foi convidado.",
  "O melhor ainda não foi revelado.",
  "GEA.",
];

// Active scroll window (fraction of total page scroll)
const START = 0.08;
const END = 0.95;

export function CinematicTrailer() {
  const { scrollYProgress } = useScroll();
  const progress = useTransform(scrollYProgress, [START, END], [0, 1], {
    clamp: true,
  });

  const [index, setIndex] = useState(-1);

  useEffect(() => {
    return progress.on("change", (v) => {
      if (v <= 0 || v >= 1) {
        setIndex(-1);
        return;
      }
      // Divide window in N slots, with gaps between each phrase
      const slot = 1 / PHRASES.length;
      const local = (v % slot) / slot; // 0..1 inside slot
      const i = Math.floor(v / slot);
      // Show phrase only in the middle 60% of each slot, leaving fade gaps
      if (local > 0.2 && local < 0.8) {
        setIndex(Math.min(i, PHRASES.length - 1));
      } else {
        setIndex(-1);
      }
    });
  }, [progress]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30 flex items-center justify-center px-6"
    >
      <AnimatePresence mode="wait">
        {index >= 0 && (
          <motion.p
            key={index}
            initial={{ opacity: 0, filter: "blur(14px)", scale: 1.06, y: 12 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1, y: 0 }}
            exit={{ opacity: 0, filter: "blur(14px)", scale: 0.98, y: -8 }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
            className="max-w-3xl text-center font-serif text-3xl leading-tight tracking-tight text-gea-cream sm:text-5xl md:text-6xl"
            style={{
              textShadow: "0 2px 30px rgba(0,0,0,0.6)",
            }}
          >
            {PHRASES[index]}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
