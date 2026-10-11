import { useEffect, useRef } from "react";
import { H, W, renderCertificate, type CertConfig } from "@/lib/certificate/renderer";

let fontsReady: Promise<unknown> | null = null;
export function ensureFonts() {
  if (typeof document === "undefined") return Promise.resolve();
  if (!fontsReady) {
    const fams = ["800 40px Manrope", "400 40px Manrope", "700 40px 'Space Grotesk'", "700 40px 'JetBrains Mono'", "400 40px 'Great Vibes'", "700 40px Cinzel", "500 40px Cinzel", "700 40px 'Cormorant Garamond'", "400 40px 'Cormorant Garamond'", "600 40px 'Playfair Display'", "800 40px 'Playfair Display'", "400 40px 'Pinyon Script'", "700 40px 'Libre Baskerville'", "400 40px 'Libre Baskerville'", "800 40px Montserrat", "600 40px Montserrat", "400 40px Montserrat"];
    fontsReady = Promise.all(fams.map((f) => document.fonts.load(f).catch(() => null)));
  }
  return fontsReady;
}

export function CertificateCanvas({ config, scale = 0.5, className }: { config: CertConfig; scale?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    let cancelled = false;
    ensureFonts().then(() => {
      const cv = ref.current;
      if (!cv || cancelled) return;
      const ctx = cv.getContext("2d")!;
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      renderCertificate(ctx, config);
    });
    return () => { cancelled = true; };
  }, [config, scale]);
  return <canvas ref={ref} width={Math.round(W * scale)} height={Math.round(H * scale)} className={className} />;
}

export async function renderToCanvas(config: CertConfig) {
  await ensureFonts();
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  renderCertificate(cv.getContext("2d")!, config);
  return cv;
}
