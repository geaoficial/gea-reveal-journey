import { useState, type CSSProperties, type ImgHTMLAttributes } from "react";

type BlurImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  /** CSS background used as the blurred placeholder (gradient or solid). */
  placeholder?: string;
};

/**
 * Image with a blurred cinematic placeholder that fades out once the real
 * asset finishes decoding. Preserves object-cover behaviour for full-bleed
 * sections. Placeholder stays hidden from AT via aria-hidden.
 */
export function BlurImage({
  placeholder = "radial-gradient(ellipse at 50% 60%, #3a1f14 0%, #1a0e0a 55%, #000 100%)",
  style,
  onLoad,
  className,
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
      <img
        {...imgProps}
        className={className}
        style={imgStyle}
        onLoad={(e) => {
          setLoaded(true);
          onLoad?.(e);
        }}
      />
    </>
  );
}
