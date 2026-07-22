import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const IG_URL = "https://instagram.com/geastoree";
const SHARE_TEXT = "Descobri a GEA. O tempo revela. — geastoree";

type Channel = "whatsapp" | "stories" | "native" | "copy";

function track(channel: Channel) {
  if (typeof window === "undefined") return;
  const p = (
    window as unknown as {
      plausible?: (event: string, opts?: { props?: Record<string, string> }) => void;
    }
  ).plausible;
  p?.("Share Click", { props: { channel } });
}

export function ShareDock() {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState("");

  useEffect(() => {
    setHref(window.location.href);
    const onScroll = () => {
      const y = window.scrollY;
      const h = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(y / h > 0.35);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const shareWhatsApp = () => {
    track("whatsapp");
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${SHARE_TEXT} — ${href}`)}`,
      "_blank",
      "noopener",
    );
  };

  const shareStories = async () => {
    track("stories");
    // Copiar link + abrir Instagram para colar no Stories.
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* noop */
    }
    window.open(IG_URL, "_blank", "noopener");
  };

  const shareNative = async () => {
    track("native");
    const nav = navigator as Navigator & { share?: (data: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ title: "GEA", text: SHARE_TEXT, url: href });
      } catch {
        /* user cancelled */
      }
    } else {
      copyLink();
    }
  };

  const copyLink = async () => {
    track("copy");
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      /* noop */
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 md:bottom-8 md:right-8"
        >
          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.96 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="flex flex-col gap-2 rounded-sm border border-gea-cream/15 bg-gea-black/85 p-2 backdrop-blur-md"
              >
                <ShareButton onClick={shareWhatsApp} label="WhatsApp" />
                <ShareButton onClick={shareStories} label="Instagram Stories" />
                <ShareButton
                  onClick={shareNative}
                  label={
                    typeof navigator !== "undefined" && "share" in navigator
                      ? "Enviar…"
                      : "Compartilhar"
                  }
                />
                <ShareButton onClick={copyLink} label={copied ? "Link copiado" : "Copiar link"} />
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            aria-label="Compartilhar a GEA"
            className="group flex items-center gap-3 border border-gea-cream/30 bg-gea-black/85 px-5 py-3 text-[0.62rem] uppercase tracking-[0.42em] text-gea-cream backdrop-blur-md transition-all duration-500 hover:border-gea-sunset hover:text-gea-sunset"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-gea-sunset/60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-gea-sunset" />
            </span>
            {expanded ? "Fechar" : "Convidar alguém"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShareButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full px-4 py-2.5 text-left text-[0.62rem] uppercase tracking-[0.36em] text-gea-cream/80 transition-colors duration-300 hover:bg-gea-cream/5 hover:text-gea-sunset"
    >
      {label}
    </button>
  );
}
