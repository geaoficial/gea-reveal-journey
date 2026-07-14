import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ImgHTMLAttributes,
} from "react";

type BlurImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** CSS background used as the blurred placeholder (gradient or solid). */
  placeholder?: string;
  /** Optional AVIF srcSet — served via <source type="image/avif"> */
  avifSrcSet?: string;
  /** Optional WebP srcSet — served via <source type="image/webp"> */
  webpSrcSet?: string;
};

// Curva cinematográfica — desaceleração suave, sem overshoot.
const CINEMATIC_EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
const FADE_MS = 260;

/**
 * Cinematic blur placeholder.
 *
 * Anti-flicker strategy:
 *  - The real <img> is always rendered above the placeholder at opacity 1,
 *    so the final asset is never softened by a blur overlay.
 *  - The blurred placeholder sits BEHIND the image and only fills the space
 *    before the browser has painted the real frame.
 *  - We wait for `img.decode()` (or fall back to `complete`) before
 *    releasing the fade, so the first painted frame of the image is
 *    already fully decoded — no partial-decode pop.
 *  - Cached images (already `complete` on mount) trigger the fade on
 *    the next microtask instead of causing a hard swap.
 */
export function BlurImage({
  placeholder = "radial-gradient(ellipse at 50% 60%, #3a1f14 0%, #1a0e0a 55%, #000 100%)",
  style,
  onLoad,
  className,
  avifSrcSet,
  webpSrcSet,
  sizes,
  srcSet,
  ...imgProps
}: BlurImageProps) {
  const [revealed, setRevealed] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Detecta preferências de acessibilidade / rede lenta uma única vez.
  const lightMode =
    typeof window !== "undefined" &&
    (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
      // @ts-expect-error Network Information API (non-standard)
      !!(navigator.connection?.saveData) ||
      // @ts-expect-error idem
      /2g/.test(navigator.connection?.effectiveType ?? ""));

  const reveal = () => {
    if (lightMode) {
      setRevealed(true);
      return;
    }
    // Duplo rAF garante que o primeiro frame decodificado da imagem seja
    // pintado antes do placeholder começar o fade — elimina o flicker.
    requestAnimationFrame(() => requestAnimationFrame(() => setRevealed(true)));
  };

  useEffect(() => {
    const img = imgRef.current;
    if (!img) return;
    let cancelled = false;

    const run = async () => {
      try {
        if (img.decode) await img.decode();
      } catch {
        /* decode pode rejeitar em alguns navegadores; seguimos assim mesmo */
      }
      if (!cancelled) reveal();
    };

    if (img.complete && img.naturalWidth > 0) {
      run();
    } else {
      const onLoadNative = () => run();
      const onError = () => reveal(); // nunca deixa o placeholder preso
      img.addEventListener("load", onLoadNative, { once: true });
      img.addEventListener("error", onError, { once: true });
      return () => {
        cancelled = true;
        img.removeEventListener("load", onLoadNative);
        img.removeEventListener("error", onError);
      };
    }
    return () => {
      cancelled = true;
    };
  }, []);

  const imgStyle: CSSProperties = {
    ...style,
    // Imagem sempre visível — sem crossfade que causa dip de luminosidade.
    opacity: 1,
  };

  const placeholderStyle: CSSProperties = {
    opacity: revealed ? 0 : 1,
    background: placeholder,
    filter: "blur(14px)",
    transform: "scale(1.06)",
    transition: `opacity ${FADE_MS}ms ${CINEMATIC_EASE}`,
    willChange: "opacity",
  };

  // Fallback JPEG url derivado do srcSet caso <picture> falhe em algum browser
  // (Safari com AVIF/WebP problemático, CDN cache inconsistente, etc.)
  const jpegFallback =
    (typeof srcSet === "string" && srcSet.split(",").pop()?.trim().split(" ")[0]) ||
    imgProps.src ||
    "";

  return (
    <>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={placeholderStyle}
      />
      {failed && jpegFallback ? (
        <div
          role="img"
          aria-label={imgProps.alt || ""}
          className={`relative z-[1] block h-full w-full ${className ?? ""}`}
          style={{
            ...style,
            backgroundImage: `url("${jpegFallback}")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      ) : (
        <picture className="relative z-[1] block h-full w-full">
          {avifSrcSet ? (
            <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
          ) : null}
          {webpSrcSet ? (
            <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
          ) : null}
          <img
            decoding="async"
            {...imgProps}
            ref={imgRef}
            srcSet={srcSet}
            sizes={sizes}
            className={className}
            style={imgStyle}
            onLoad={(e) => {
              onLoad?.(e);
            }}
            onError={() => {
              setFailed(true);
              setRevealed(true);
            }}
          />
        </picture>
      )}
    </>
  );
}
