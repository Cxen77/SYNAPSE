// Additional background painters inspired by real-world certificates.
import { H, W, RENDERERS, base, mix, rgba, roundRect, text, SERIF, GARAMOND, CINZEL, SCRIPT, GROTESK, MANROPE, MONO, type Theme } from "./renderer";

type Ctx = CanvasRenderingContext2D;
const LIBRE = "'Libre Baskerville', Georgia, serif";
const PINYON = "'Pinyon Script', cursive";
const MONT = "'Montserrat', Arial, sans-serif";

function guilloche(ctx: Ctx, x: number, y: number, w: number, h: number, col: string, lw = 1.4) {
  ctx.save();
  ctx.strokeStyle = col; ctx.lineWidth = lw;
  const drawBand = (len: number, along: (t: number, off: number) => [number, number]) => {
    for (let k = 0; k < 6; k++) {
      ctx.beginPath();
      for (let t = 0; t <= len; t += 4) {
        const off = Math.sin(t / 22 + k) * 14 + Math.sin(t / 9 + k * 2) * 6;
        const [px, py] = along(t, off);
        t ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
      }
      ctx.stroke();
    }
  };
  drawBand(w, (t, o) => [x + t, y + o]);
  drawBand(w, (t, o) => [x + t, y + h + o]);
  drawBand(h, (t, o) => [x + o, y + t]);
  drawBand(h, (t, o) => [x + w + o, y + t]);
  ctx.restore();
}

function rosetteWatermark(ctx: Ctx, cx: number, cy: number, r: number, col: string) {
  ctx.save(); ctx.strokeStyle = col; ctx.lineWidth = 1.5;
  for (let i = 0; i < 36; i++) {
    ctx.beginPath();
    ctx.ellipse(cx, cy, r, r * 0.32, (Math.PI * i) / 36, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
}

function crest(ctx: Ctx, cx: number, cy: number, s: number, col: string, ink: string) {
  ctx.save();
  ctx.fillStyle = col;
  ctx.beginPath();
  ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy - s); ctx.lineTo(cx + s, cy + s * 0.2);
  ctx.quadraticCurveTo(cx + s, cy + s * 1.1, cx, cy + s * 1.4);
  ctx.quadraticCurveTo(cx - s, cy + s * 1.1, cx - s, cy + s * 0.2); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = ink; ctx.lineWidth = 5; ctx.stroke();
  ctx.strokeStyle = rgba(ink, 0.7); ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(cx, cy - s); ctx.lineTo(cx, cy + s * 1.4); ctx.moveTo(cx - s, cy + s * 0.1); ctx.lineTo(cx + s, cy + s * 0.1); ctx.stroke();
  // laurels
  ctx.strokeStyle = col; ctx.lineWidth = 4;
  for (const d of [-1, 1]) {
    ctx.beginPath(); ctx.arc(cx, cy + s * 0.2, s * 1.6, d < 0 ? Math.PI * 0.55 : Math.PI * 0.05, d < 0 ? Math.PI * 0.95 : Math.PI * 0.45); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = d < 0 ? Math.PI * (0.58 + i * 0.055) : Math.PI * (0.42 - i * 0.055);
      const x = cx + Math.cos(a) * s * 1.6, y = cy + s * 0.2 + Math.sin(a) * s * 1.6;
      ctx.fillStyle = col; ctx.beginPath(); ctx.ellipse(x, y, 22, 9, a + (d < 0 ? 0.9 : -0.9), 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

function goldGrad(ctx: Ctx, a: string, x0 = 0, x1 = W) {
  const g = ctx.createLinearGradient(x0, 0, x1, H);
  [0, 0.25, 0.5, 0.75, 1].forEach((t, i) => g.addColorStop(t, i % 2 ? mix(a, "#fff6d5", 0.55) : mix(a, "#3d2a05", 0.25)));
  return g;
}

const extra: Record<string, (ctx: Ctx, a: string) => Theme> = {
  degree(ctx, a) {
    ctx.fillStyle = "#fbf8f1"; ctx.fillRect(0, 0, W, H);
    rosetteWatermark(ctx, W / 2, H / 2 + 60, 560, rgba(a, 0.06));
    guilloche(ctx, 90, 90, W - 180, H - 180, rgba(a, 0.55));
    ctx.strokeStyle = a; ctx.lineWidth = 3; ctx.strokeRect(150, 150, W - 300, H - 300);
    return base(a, { ink: "#1f1a14", muted: "#6d6456", titleFont: LIBRE, titleWeight: "700", titleTracking: 8, nameFont: PINYON, nameWeight: "400", nameSize: 190, bodyFont: LIBRE, ruleColor: a, sealInk: "#fff8e8", top: 300 });
  },
  crest(ctx, a) {
    ctx.fillStyle = "#f7f2e6"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = a; ctx.lineWidth = 22; ctx.strokeRect(70, 70, W - 140, H - 140);
    ctx.strokeStyle = "#b8923a"; ctx.lineWidth = 3; ctx.strokeRect(112, 112, W - 224, H - 224);
    crest(ctx, W / 2, 200, 70, a, "#b8923a");
    return base(a, { ink: "#221a10", muted: "#76684f", titleFont: CINZEL, titleWeight: "700", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, ruleColor: "#b8923a", sealInk: "#fff7e6", top: 420 });
  },
  guilloche(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, rgba(a, 0.05)); g.addColorStop(1, rgba(mix(a, "#22c55e", 0.5), 0.07));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 3; i++) guilloche(ctx, 70 + i * 22, 70 + i * 22, W - 140 - i * 44, H - 140 - i * 44, rgba(a, 0.35 - i * 0.08), 1.2);
    rosetteWatermark(ctx, 330, H - 330, 170, rgba(a, 0.18));
    return base(a, { ink: "#0f2a26", muted: "#56706b", titleFont: MONT, titleWeight: "800", titleTracking: 14, nameFont: SERIF, nameWeight: "600", nameSize: 160, bodyFont: MONT, labelFont: MONT });
  },
  parchment(ctx, a) {
    const g = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 1600);
    g.addColorStop(0, "#f6ead0"); g.addColorStop(1, "#d9bf8c");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 1400; i++) { ctx.fillStyle = rgba("#6b4b1a", Math.random() * 0.05); ctx.fillRect(Math.random() * W, Math.random() * H, 3, 3); }
    ctx.strokeStyle = rgba("#5a3d12", 0.7); ctx.lineWidth = 6; ctx.strokeRect(120, 120, W - 240, H - 240);
    ctx.lineWidth = 2; ctx.strokeRect(140, 140, W - 280, H - 280);
    return base(a, { ink: "#3a2608", muted: "#6e5530", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: PINYON, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, eventColor: a, ruleColor: rgba("#5a3d12", 0.7), sealInk: "#fff4dc" });
  },
  minimal(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = "#111111"; ctx.lineWidth = 2; ctx.strokeRect(100, 100, W - 200, H - 200);
    ctx.fillStyle = a; ctx.fillRect(W / 2 - 40, 100 - 4, 80, 8);
    return base(a, { ink: "#111111", muted: "#777777", titleFont: MONT, titleWeight: "600", titleTracking: 28, nameFont: SERIF, nameWeight: "600", nameSize: 150, bodyFont: MONT, labelFont: MONT, eventColor: "#111111", ruleColor: "#111111" });
  },
  split(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(W - 720, 0, 720, H);
    ctx.fillStyle = rgba("#ffffff", 0.12);
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(W - 360, H / 2, 120 + i * 90, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = rgba("#ffffff", 0.15); ctx.stroke(); }
    return base(a, { align: "left", ink: "#0f172a", muted: "#64748b", titleFont: MONT, titleWeight: "800", titleTracking: 8, nameFont: MONT, nameWeight: "800", nameSize: 150, bodyFont: MANROPE, labelFont: MONT, left: 220, top: 260 });
  },
  glass(ctx, a) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, mix(a, "#0f172a", 0.35)); g.addColorStop(1, mix(a, "#ec4899", 0.45));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rgba("#ffffff", 0.14); ctx.beginPath(); ctx.arc(300, 250, 380, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(W - 250, H - 200, 460, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba("#ffffff", 0.16); roundRect(ctx, 150, 150, W - 300, H - 300, 70); ctx.fill();
    ctx.strokeStyle = rgba("#ffffff", 0.45); ctx.lineWidth = 3; ctx.stroke();
    return base(a, { ink: "#ffffff", muted: "rgba(255,255,255,0.8)", titleFont: MANROPE, nameFont: MANROPE, nameWeight: "800", nameSize: 150, eventColor: "#ffffff", ruleColor: "#ffffff", sealInk: "#ffffff" });
  },
  neon(ctx, a) {
    ctx.fillStyle = "#0a0614"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createLinearGradient(0, H, W, 0);
    g.addColorStop(0, rgba(a, 0.35)); g.addColorStop(0.5, rgba("#000000", 0)); g.addColorStop(1, rgba(mix(a, "#22d3ee", 0.7), 0.35));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.shadowColor = a; ctx.shadowBlur = 40; ctx.strokeStyle = a; ctx.lineWidth = 6;
    roundRect(ctx, 90, 90, W - 180, H - 180, 40); ctx.stroke();
    ctx.shadowColor = mix(a, "#22d3ee", 0.7); ctx.strokeStyle = mix(a, "#22d3ee", 0.7); ctx.lineWidth = 3;
    roundRect(ctx, 120, 120, W - 240, H - 240, 30); ctx.stroke(); ctx.shadowBlur = 0;
    return base(a, { ink: "#f5f3ff", muted: "#a5a0c4", titleFont: GROTESK, titleWeight: "700", titleTracking: 16, nameFont: GROTESK, nameWeight: "700", nameSize: 160, bodyFont: GROTESK, labelFont: MONO, sealInk: "#0a0614" });
  },
  circuit(ctx, a) {
    ctx.fillStyle = "#06140f"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(a, 0.35); ctx.lineWidth = 3; ctx.fillStyle = rgba(a, 0.6);
    let seed = 7; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 70; i++) {
      let x = rnd() < 0.5 ? rnd() * 500 : W - rnd() * 500, y = rnd() * H;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let s = 0; s < 4; s++) { rnd() < 0.5 ? (x += (rnd() - 0.5) * 300) : (y += (rnd() - 0.5) * 300); ctx.lineTo(x, y); }
      ctx.stroke(); ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = "rgba(6,20,15,0.85)"; roundRect(ctx, 420, 110, W - 840, H - 220, 30); ctx.fill();
    ctx.strokeStyle = a; ctx.lineWidth = 3; ctx.stroke();
    return base(a, { ink: "#e7fff5", muted: "#86b3a2", titleFont: MONO, titleWeight: "700", titleTracking: 10, nameFont: GROTESK, nameWeight: "700", nameSize: 150, bodyFont: GROTESK, labelFont: MONO, sealInk: "#06140f" });
  },
  mesh(ctx, a) {
    ctx.fillStyle = "#fafafa"; ctx.fillRect(0, 0, W, H);
    const cols = [a, mix(a, "#f472b6", 0.6), mix(a, "#fde047", 0.6), mix(a, "#22d3ee", 0.6)];
    [[0, 0], [W, 0], [0, H], [W, H]].forEach(([x, y], i) => {
      const g = ctx.createRadialGradient(x!, y!, 0, x!, y!, 1400);
      g.addColorStop(0, rgba(cols[i]!, 0.75)); g.addColorStop(1, rgba(cols[i]!, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    });
    ctx.fillStyle = "rgba(255,255,255,0.82)"; roundRect(ctx, 180, 160, W - 360, H - 320, 40); ctx.fill();
    return base(a, { ink: "#111827", titleFont: GROTESK, titleWeight: "700", nameFont: GROTESK, nameWeight: "700", nameSize: 160, bodyFont: MANROPE, top: 300 });
  },
  goldfoil(ctx, a) {
    ctx.fillStyle = "#fffdf8"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = goldGrad(ctx, a);
    ctx.fillRect(0, 0, W, 60); ctx.fillRect(0, H - 60, W, 60); ctx.fillRect(0, 0, 60, H); ctx.fillRect(W - 60, 0, 60, H);
    ctx.strokeStyle = goldGrad(ctx, a); ctx.lineWidth = 4; ctx.strokeRect(110, 110, W - 220, H - 220);
    ctx.beginPath(); ctx.moveTo(0, 520); ctx.lineTo(520, 0); ctx.lineTo(700, 0); ctx.lineTo(0, 700); ctx.fill();
    ctx.fillStyle = goldGrad(ctx, a); ctx.beginPath(); ctx.moveTo(0, 520); ctx.lineTo(520, 0); ctx.lineTo(620, 0); ctx.lineTo(0, 620); ctx.fill();
    ctx.beginPath(); ctx.moveTo(W, H - 520); ctx.lineTo(W - 520, H); ctx.lineTo(W - 620, H); ctx.lineTo(W, H - 620); ctx.fill();
    return base(a, { ink: "#1c1508", muted: "#7d6a46", titleFont: CINZEL, titleWeight: "700", titleTracking: 16, nameFont: PINYON, nameWeight: "400", nameSize: 200, bodyFont: LIBRE, eventColor: mix(a, "#000000", 0.25), ruleColor: a, sealInk: "#1c1508" });
  },
  marble(ctx, a) {
    ctx.fillStyle = "#f4f3f1"; ctx.fillRect(0, 0, W, H);
    let seed = 3; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 26; i++) {
      ctx.strokeStyle = rgba("#6b7280", 0.05 + rnd() * 0.1); ctx.lineWidth = 1 + rnd() * 4;
      ctx.beginPath(); let x = rnd() * W, y = 0; ctx.moveTo(x, y);
      while (y < H) { x += (rnd() - 0.45) * 120; y += 40 + rnd() * 60; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    ctx.strokeStyle = a; ctx.lineWidth = 6; ctx.strokeRect(110, 110, W - 220, H - 220);
    return base(a, { ink: "#1f2937", titleFont: GARAMOND, titleWeight: "700", titleTracking: 20, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND });
  },
  emerald(ctx, a) {
    ctx.fillStyle = mix(a, "#021a12", 0.6); ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba("#d4b16a", 0.12); ctx.lineWidth = 2;
    for (let x = -H; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + H, H); ctx.stroke(); }
    ctx.strokeStyle = "#d4b16a"; ctx.lineWidth = 8; ctx.strokeRect(90, 90, W - 180, H - 180);
    ctx.lineWidth = 2; ctx.strokeRect(125, 125, W - 250, H - 250);
    return base("#d4b16a", { ink: "#f4efe2", muted: "#b9c7bd", titleFont: CINZEL, titleWeight: "700", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, sealInk: "#0b2a1d" });
  },
  course(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#f4f6fb"; ctx.fillRect(W - 700, 0, 700, H);
    ctx.fillStyle = a; ctx.fillRect(W - 700, 0, 10, H);
    // ribbon badge
    ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(W - 430, 0); ctx.lineTo(W - 270, 0); ctx.lineTo(W - 270, 520); ctx.lineTo(W - 350, 460); ctx.lineTo(W - 430, 520); ctx.fill();
    return base(a, { align: "left", ink: "#1f2937", muted: "#6b7280", titleFont: MONT, titleWeight: "700", titleTracking: 6, nameFont: SERIF, nameWeight: "600", nameSize: 150, bodyFont: MANROPE, labelFont: MONT, eventColor: "#111827", left: 200, top: 260 });
  },
  badge(ctx, a) {
    ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "#ffffff"; roundRect(ctx, 80, 80, W - 160, H - 160, 40); ctx.fill();
    ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(W - 80, 80); ctx.lineTo(W - 80, 700); ctx.lineTo(W - 900, 80); ctx.fill();
    ctx.fillStyle = rgba(a, 0.08);
    for (let i = 0; i < 8; i++) for (let j = 0; j < 5; j++) { ctx.beginPath(); ctx.arc(200 + i * 60, H - 460 + j * 60, 8, 0, Math.PI * 2); ctx.fill(); }
    return base(a, { align: "left", ink: "#0f172a", muted: "#64748b", titleFont: MONT, titleWeight: "800", titleTracking: 10, nameFont: MONT, nameWeight: "800", nameSize: 150, bodyFont: MANROPE, labelFont: MONT, left: 220, top: 260 });
  },
  confetti(ctx, a) {
    ctx.fillStyle = "#fffaf3"; ctx.fillRect(0, 0, W, H);
    const cols = [a, "#f59e0b", "#10b981", "#3b82f6", "#ec4899"];
    let seed = 11; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    for (let i = 0; i < 220; i++) {
      let x = rnd() * W, y = rnd() * H;
      if (x > 380 && x < W - 380 && y > 260 && y < H - 260) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(rnd() * 6); ctx.fillStyle = cols[i % 5]!;
      rnd() < 0.5 ? ctx.fillRect(-14, -5, 28, 10) : (ctx.beginPath(), ctx.arc(0, 0, 8, 0, Math.PI * 2), ctx.fill());
      ctx.restore();
    }
    return base(a, { ink: "#1f1235", muted: "#6b5a7d", titleFont: MONT, titleWeight: "800", titleTracking: 10, nameFont: SERIF, nameWeight: "800", nameSize: 160, bodyFont: MANROPE });
  },
  mandala(ctx, a) {
    ctx.fillStyle = "#fff8ee"; ctx.fillRect(0, 0, W, H);
    const m = (cx: number, cy: number, r: number) => {
      ctx.save(); ctx.translate(cx, cy);
      for (let ring = 1; ring <= 5; ring++) {
        const n = 8 + ring * 4;
        for (let i = 0; i < n; i++) {
          ctx.rotate((Math.PI * 2) / n);
          ctx.strokeStyle = rgba(ring % 2 ? a : "#d97706", 0.45); ctx.lineWidth = 3;
          ctx.beginPath(); ctx.ellipse(0, (r * ring) / 5, (r / 20) * (1 + ring * 0.3), (r / 9), 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
      ctx.restore();
    };
    m(0, 0, 600); m(W, H, 600); m(W, 0, 360); m(0, H, 360);
    ctx.strokeStyle = rgba(a, 0.5); ctx.lineWidth = 4; ctx.strokeRect(110, 110, W - 220, H - 220);
    return base(a, { ink: "#3b1606", muted: "#8a5a3a", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, sealInk: "#fff8ee" });
  },
  medal(ctx, a) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#0b1220"); g.addColorStop(1, "#1e293b");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rgba(a, 0.9);
    for (const x of [-120, 0]) { ctx.beginPath(); ctx.moveTo(x, H); ctx.lineTo(x + 380, 0); ctx.lineTo(x + 470, 0); ctx.lineTo(x + 90, H); ctx.fill(); }
    ctx.fillStyle = rgba("#ffffff", 0.9);
    ctx.beginPath(); ctx.moveTo(W - 90, H); ctx.lineTo(W - 470, 0); ctx.lineTo(W - 380, 0); ctx.lineTo(W, H); ctx.fill();
    text(ctx, "★ ★ ★", W / 2, 170, `400 40px ${MANROPE}`, a, "center");
    return base(a, { ink: "#f8fafc", muted: "#94a3b8", titleFont: MONT, titleWeight: "800", titleTracking: 14, nameFont: MONT, nameWeight: "800", nameSize: 160, bodyFont: MANROPE, labelFont: MONT, sealInk: "#0b1220", top: 300 });
  },
};

Object.assign(RENDERERS, extra);

export type TemplateDef = { id: string; name: string; group: string; accent: string };
export const TEMPLATE_LIST: TemplateDef[] = [
  { id: "degree", name: "University Degree", group: "Classic", accent: "#1e3a8a" },
  { id: "crest", name: "Royal Crest", group: "Classic", accent: "#7f1d1d" },
  { id: "guilloche", name: "Guilloche", group: "Classic", accent: "#0f766e" },
  { id: "parchment", name: "Parchment", group: "Classic", accent: "#7c2d12" },
  { id: "academic", name: "Academic", group: "Classic", accent: "#7f1d1d" },
  { id: "aurora", name: "Aurora", group: "Modern", accent: "#6d5dfc" },
  { id: "swiss", name: "Swiss", group: "Modern", accent: "#ef4444" },
  { id: "minimal", name: "Minimal Line", group: "Modern", accent: "#2563eb" },
  { id: "split", name: "Bold Split", group: "Modern", accent: "#4f46e5" },
  { id: "glass", name: "Glass", group: "Modern", accent: "#7c3aed" },
  { id: "modern", name: "Corporate", group: "Modern", accent: "#2563eb" },
  { id: "geometric", name: "Geometric", group: "Modern", accent: "#f59e0b" },
  { id: "hackathon", name: "Terminal", group: "Tech", accent: "#22d3ee" },
  { id: "neon", name: "Hackathon Neon", group: "Tech", accent: "#d946ef" },
  { id: "circuit", name: "Circuit", group: "Tech", accent: "#10b981" },
  { id: "mesh", name: "Gradient Mesh", group: "Tech", accent: "#6366f1" },
  { id: "luxe", name: "Noir Luxe", group: "Premium", accent: "#d4a843" },
  { id: "goldfoil", name: "Gold Foil", group: "Premium", accent: "#c9a13b" },
  { id: "marble", name: "Marble", group: "Premium", accent: "#a16207" },
  { id: "emerald", name: "Emerald", group: "Premium", accent: "#065f46" },
  { id: "course", name: "Online Course", group: "Course", accent: "#0056d2" },
  { id: "badge", name: "Pro Badge", group: "Course", accent: "#0ea5e9" },
  { id: "ribbon", name: "Ribbon", group: "Course", accent: "#0f766e" },
  { id: "sunset", name: "Sunset", group: "Festive", accent: "#e11d48" },
  { id: "botanical", name: "Botanical", group: "Festive", accent: "#4d7c0f" },
  { id: "confetti", name: "Confetti", group: "Festive", accent: "#8b5cf6" },
  { id: "mandala", name: "Mandala", group: "Festive", accent: "#b91c1c" },
  { id: "medal", name: "Sports Medal", group: "Festive", accent: "#eab308" },
];

export function paintBackground(id: string, accent: string, width = W, height = H) {
  const cv = document.createElement("canvas");
  cv.width = width; cv.height = height;
  const ctx = cv.getContext("2d")!;
  ctx.scale(width / W, height / H);
  const theme = (RENDERERS[id] ?? RENDERERS["modern"]!)(ctx, accent);
  return { canvas: cv, theme };
}
