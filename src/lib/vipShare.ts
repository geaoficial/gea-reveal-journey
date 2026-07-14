/**
 * Gera uma imagem premium do Selo VIP (1080x1350) para compartilhamento.
 * Puro Canvas 2D — sem dependências.
 */
export async function generateVipShareImage(opts: {
  name: string | null;
  memberId: string;
}): Promise<Blob> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D indisponível");

  // Fundo preto fosco com gradiente radial
  const bg = ctx.createRadialGradient(W / 2, H * 0.35, 60, W / 2, H * 0.55, W);
  bg.addColorStop(0, "#1a1a1a");
  bg.addColorStop(0.55, "#0a0a0a");
  bg.addColorStop(1, "#000000");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Halo âmbar sutil
  const halo = ctx.createRadialGradient(W / 2, H * 0.42, 20, W / 2, H * 0.42, 620);
  halo.addColorStop(0, "rgba(232,138,58,0.22)");
  halo.addColorStop(1, "rgba(232,138,58,0)");
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, W, H);

  // Grain leve
  const grain = ctx.createImageData(W, H);
  for (let i = 0; i < grain.data.length; i += 4) {
    const v = (Math.random() * 18) | 0;
    grain.data[i] = v; grain.data[i + 1] = v; grain.data[i + 2] = v;
    grain.data[i + 3] = 14;
  }
  ctx.putImageData(grain, 0, 0);

  // Moldura prateada
  ctx.strokeStyle = "rgba(200,200,200,0.28)";
  ctx.lineWidth = 1;
  ctx.strokeRect(48, 48, W - 96, H - 96);
  ctx.strokeStyle = "rgba(200,200,200,0.08)";
  ctx.strokeRect(64, 64, W - 128, H - 128);

  // Tag topo
  ctx.fillStyle = "rgba(220,220,220,0.6)";
  ctx.font = "500 20px 'Space Grotesk', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("G E A   ·   E S T   2 0 2 4", W / 2, 140);

  // Logo GEA gigante com gradiente prata
  const logoGrad = ctx.createLinearGradient(0, 300, 0, 560);
  logoGrad.addColorStop(0, "#ffffff");
  logoGrad.addColorStop(0.55, "#c8c8c8");
  logoGrad.addColorStop(1, "#6f6f6f");
  ctx.fillStyle = logoGrad;
  ctx.font = "500 260px 'Space Grotesk', system-ui, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("GEA", W / 2, 430);

  // Linha fina
  ctx.strokeStyle = "rgba(232,138,58,0.7)";
  ctx.beginPath();
  ctx.moveTo(W / 2 - 60, 560);
  ctx.lineTo(W / 2 + 60, 560);
  ctx.stroke();

  // Título Selo
  ctx.fillStyle = "#f2f2f2";
  ctx.font = "500 42px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("S E L O   V I P   G E A", W / 2, 640);

  // Primeiros da GEA
  ctx.fillStyle = "rgba(232,138,58,0.9)";
  ctx.font = "500 26px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("P R I M E I R O S   D A   G E A", W / 2, 700);

  // Nome + Nº
  const displayName = (opts.name || "Anônimo").toUpperCase();
  ctx.fillStyle = "rgba(220,220,220,0.5)";
  ctx.font = "500 20px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("M E M B R O", W / 2, 830);
  ctx.fillStyle = "#f0f0f0";
  ctx.font = "500 44px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText(displayName, W / 2, 890);
  ctx.fillStyle = "rgba(220,220,220,0.55)";
  ctx.font = "500 24px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText(`Nº ${opts.memberId || "----"}`, W / 2, 940);

  // Frase final
  ctx.fillStyle = "rgba(240,240,240,0.85)";
  ctx.font = "italic 40px 'Instrument Serif', 'Space Grotesk', serif";
  ctx.fillText("“O tempo revela.”", W / 2, H - 220);

  // Assinatura
  ctx.fillStyle = "rgba(220,220,220,0.4)";
  ctx.font = "500 18px 'Space Grotesk', system-ui, sans-serif";
  ctx.fillText("@ G E A S T O R E E", W / 2, H - 130);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("toBlob failed"))), "image/png", 0.95);
  });
}

export async function shareVipImage(opts: { name: string | null; memberId: string }) {
  const blob = await generateVipShareImage(opts);
  const file = new File([blob], `selo-vip-gea-${opts.memberId || "member"}.png`, { type: "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: { files?: File[] }) => boolean;
    share?: (data: { files?: File[]; title?: string; text?: string }) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({
        files: [file],
        title: "Selo VIP GEA",
        text: "Faço parte dos Primeiros da GEA. O tempo revela.",
      });
      return "shared" as const;
    } catch {
      /* usuário cancelou — fallback abaixo */
    }
  }

  // Fallback: download
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
  return "downloaded" as const;
}
