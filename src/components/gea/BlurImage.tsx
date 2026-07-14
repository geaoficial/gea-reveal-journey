import { useState, type CSSProperties, type ImgHTMLAttributes } from "react";

type BlurImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** CSS background used as the blurred placeholder (gradient or solid). */
  placeholder?: string;
  /** Optional AVIF srcSet — served via <source type="image/avif"> */
  avifSrcSet?: string;
  /** Optional WebP srcSet — served via <source type="image/webp"> */
  webpSrcSet?: string;
};

/**
 * Image with a blurred cinematic placeholder that fades out once the real
 * asset finishes decoding. When avifSrcSet / webpSrcSet are provided, the
 * browser negotiates the best format via <picture>; falls back to the JPEG
 * src/srcSet automatically.
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
  const [loaded, setLoaded] = useState(false);

  const imgStyle: CSSProperties = {
    ...style,
    opacity: loaded ? 1 : 0,
    transition: "opacity 700ms ease",
  };

  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          opacity: loaded ? 0 : 1,
          background: placeholder,
          filter: "blur(28px)",
          transform: "scale(1.06)",
        }}
      />
      <picture>
        {avifSrcSet ? (
          <source type="image/avif" srcSet={avifSrcSet} sizes={sizes} />
        ) : null}
        {webpSrcSet ? (
          <source type="image/webp" srcSet={webpSrcSet} sizes={sizes} />
        ) : null}
        <img
          {...imgProps}
          srcSet={srcSet}
          sizes={sizes}
          className={className}
          style={imgStyle}
          onLoad={(e) => {
            setLoaded(true);
            onLoad?.(e);
          }}
        />
      </picture>
    </>
  );
}
