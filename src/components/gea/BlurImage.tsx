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
const FADE_MS = 1100;

/**
 * Cinematic blur placeholder.
 *
 * Anti-flicker strategy:
 *  - The real <img> is always rendered at opacity 1 (never crossfaded),
 *    so its own brightness never dips.
 *  - The blurred placeholder sits ON TOP with pointer-events: none and
 *    fades from opacity 1 → 0 once the image is decoded.
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
  const imgRef = useRef<HTMLImageElement | null>(null);

  const reveal = () => {
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
    filter: "blur(28px)",
    transform: "scale(1.06)",
    transition: `opacity ${FADE_MS}ms ${CINEMATIC_EASE}`,
    willChange: "opacity",
  };

  return (
    <>
      <picture>
        {avifSrcSet ? (
          <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        ) : null}
        {webpSrcSet ? (
          <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        ) : null}
        <img
          {...imgProps}
          ref={imgRef}
          srcSet={srcSet}
          sizes={sizes}
          className={className}
          style={imgStyle}
          onLoad={(e) => {
            onLoad?.(e);
          }}
        />
      </picture>
      {/* Placeholder sobreposto — fade cinematográfico saindo por cima. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={placeholderStyle}
      />
    </>
  );
}
