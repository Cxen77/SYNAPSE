// More background painters modelled on real certificates. Registers into RENDERERS + TEMPLATE_LIST.
import { H, W, RENDERERS, base, mix, rgba, roundRect, text, SERIF, GARAMOND, CINZEL, SCRIPT, GROTESK, MANROPE, MONO } from "./renderer";
import { TEMPLATE_LIST } from "./backgrounds";

type Ctx = CanvasRenderingContext2D;
const MONT = "'Montserrat', Arial, sans-serif";
const LIBRE = "'Libre Baskerville', Georgia, serif";

function frame(ctx: Ctx, inset: number, col: string, lw: number) { ctx.strokeStyle = col; ctx.lineWidth = lw; ctx.strokeRect(inset, inset, W - inset * 2, H - inset * 2); }
function star(ctx: Ctx, cx: number, cy: number, r: number, col: string) {
  ctx.fillStyle = col; ctx.beginPath();
  for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (Math.PI * i) / 5; const rr = i % 2 ? r * 0.45 : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function rand(seed: number) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }

const extra: typeof RENDERERS = {
  ivy(ctx, a) {
    ctx.fillStyle = "#fbf8ef"; ctx.fillRect(0, 0, W, H);
    frame(ctx, 70, a, 10); frame(ctx, 100, rgba(a, 0.6), 2); frame(ctx, 130, a, 4);
    for (const [x, y] of [[130, 130], [W - 130, 130], [130, H - 130], [W - 130, H - 130]] as const) { ctx.fillStyle = a; ctx.beginPath(); ctx.arc(x, y, 26, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 0.06; star(ctx, W / 2, H / 2 + 80, 520, a); ctx.globalAlpha = 1;
    return base(a, { ink: "#1c1917", muted: "#57534e", titleFont: "'Cinzel', serif", titleWeight: "700", titleTracking: 10, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, labelFont: LIBRE });
  },
  government(ctx, a) {
    ctx.fillStyle = "#fffdf7"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(a, 0.18); ctx.lineWidth = 1.2;
    for (let i = 0; i < 80; i++) { ctx.beginPath(); for (let x = 0; x <= W; x += 20) { const y = i * 24 + Math.sin(x / 90 + i) * 10; x ? ctx.lineTo(x, y) : ctx.moveTo(x, y); } ctx.stroke(); }
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 40); ctx.fillRect(0, H - 40, W, 40);
    frame(ctx, 90, a, 6);
    ctx.strokeStyle = rgba(a, 0.12); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W / 2, H / 2 + 60, 460, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, H / 2 + 60, 420, 0, Math.PI * 2); ctx.stroke();
    return base(a, { ink: "#111827", muted: "#4b5563", titleFont: SERIF, titleWeight: "700", titleTracking: 8, nameFont: SERIF, nameWeight: "700", nameSize: 140, bodyFont: LIBRE, labelFont: MONT });
  },
  corporate(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(0, 0, 520, H);
    ctx.fillStyle = mix(a, "#000000", 0.3); ctx.beginPath(); ctx.moveTo(520, 0); ctx.lineTo(640, 0); ctx.lineTo(520, H); ctx.fill();
    ctx.fillStyle = rgba("#ffffff", 0.1); for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.arc(260, 300 + i * 240, 90, 0, Math.PI * 2); ctx.fill(); }
    return base(a, { align: "left", left: 820, ink: "#0f172a", muted: "#64748b", titleFont: MONT, titleWeight: "800", titleTracking: 10, nameFont: MONT, nameWeight: "700", nameSize: 150, labelFont: MONT });
  },
  olympic(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    const cols = ["#0081c8", "#fcb131", "#000000", "#00a651", "#ee334e"];
    cols.forEach((c, i) => { ctx.strokeStyle = rgba(c, 0.15); ctx.lineWidth = 30; ctx.beginPath(); ctx.arc(W / 2 - 480 + i * 240, H / 2 + (i % 2) * 120 + 60, 200, 0, Math.PI * 2); ctx.stroke(); });
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 30); ctx.fillRect(0, H - 30, W, 30);
    frame(ctx, 80, rgba(a, 0.5), 4);
    return base(a, { ink: "#111827", muted: "#6b7280", titleFont: MONT, titleWeight: "900", titleTracking: 16, nameFont: MONT, nameWeight: "800", nameSize: 160, labelFont: MONT });
  },
  japanese(ctx, a) {
    ctx.fillStyle = "#f5f1e8"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.beginPath(); ctx.arc(W - 380, 380, 200, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = "#1c1917"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(200, H - 200); ctx.lineTo(W - 200, H - 200); ctx.stroke();
    for (let i = 0; i < 5; i++) { ctx.strokeStyle = rgba("#1c1917", 0.15); ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(-100, H + 100, 400 + i * 60, -Math.PI / 2, 0); ctx.stroke(); }
    return base(a, { align: "left", left: 260, ink: "#1c1917", muted: "#78716c", titleFont: SERIF, titleWeight: "400", titleTracking: 24, nameFont: SERIF, nameWeight: "400", nameSize: 150, bodyFont: GARAMOND });
  },
  artdeco(ctx, a) {
    ctx.fillStyle = "#0c0a09"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = a; ctx.lineWidth = 4; frame(ctx, 70, a, 4); frame(ctx, 95, a, 1.5);
    for (const [cx, cy, s] of [[0, 0, 1], [W, 0, -1], [0, H, 1], [W, H, -1]] as const) {
      for (let i = 1; i <= 7; i++) { ctx.beginPath(); ctx.moveTo(cx + s * i * 50, cy); ctx.lineTo(cx, cy + (cy ? -1 : 1) * i * 50); ctx.stroke(); }
    }
    for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(W / 2, 250); ctx.lineTo(W / 2 + i * 60, 130); ctx.stroke(); }
    return base(a, { ink: "#fafaf9", muted: mix(a, "#ffffff", 0.3), titleFont: CINZEL, titleWeight: "700", titleTracking: 20, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, sealInk: "#0c0a09", top: 330 });
  },
  stamp(ctx, a) {
    ctx.fillStyle = "#efe6d2"; ctx.fillRect(0, 0, W, H);
    const r = rand(7); for (let i = 0; i < 3000; i++) { ctx.fillStyle = rgba("#6b4f2a", r() * 0.08); ctx.fillRect(r() * W, r() * H, 3, 3); }
    ctx.fillStyle = "#fbf6ea"; roundRect(ctx, 120, 120, W - 240, H - 240, 8); ctx.fill();
    ctx.fillStyle = "#efe6d2"; for (let x = 120; x <= W - 120; x += 40) { ctx.beginPath(); ctx.arc(x, 120, 14, 0, Math.PI * 2); ctx.arc(x, H - 120, 14, 0, Math.PI * 2); ctx.fill(); }
    for (let y = 120; y <= H - 120; y += 40) { ctx.beginPath(); ctx.arc(120, y, 14, 0, Math.PI * 2); ctx.arc(W - 120, y, 14, 0, Math.PI * 2); ctx.fill(); }
    frame(ctx, 170, rgba(a, 0.7), 3);
    return base(a, { ink: "#3f2d14", muted: "#7c6444", titleFont: SERIF, titleWeight: "800", titleTracking: 10, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, bodyFont: LIBRE, labelFont: MONO });
  },
  watercolor(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    const r = rand(3);
    for (const [cx, cy] of [[0, 0], [W, H], [W, 0], [0, H]] as const) for (let i = 0; i < 40; i++) {
      const g = ctx.createRadialGradient(cx + (r() - 0.5) * 500, cy + (r() - 0.5) * 500, 0, cx, cy, 300 + r() * 400);
      g.addColorStop(0, rgba(i % 2 ? a : mix(a, "#f0abfc", 0.5), 0.05)); g.addColorStop(1, rgba(a, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    return base(a, { ink: "#1f2937", muted: "#6b7280", titleFont: SERIF, titleWeight: "600", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND });
  },
  blackgold(ctx, a) {
    const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.7); g.addColorStop(0, "#1c1917"); g.addColorStop(1, "#000000");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const gold = ctx.createLinearGradient(0, 0, W, H); gold.addColorStop(0, mix(a, "#fff7d6", 0.4)); gold.addColorStop(0.5, a); gold.addColorStop(1, mix(a, "#000000", 0.3));
    ctx.strokeStyle = gold; ctx.lineWidth = 8; ctx.strokeRect(80, 80, W - 160, H - 160); ctx.lineWidth = 2; ctx.strokeRect(110, 110, W - 220, H - 220);
    ctx.fillStyle = gold; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(500, 0); ctx.lineTo(0, 500); ctx.fill(); ctx.beginPath(); ctx.moveTo(W, H); ctx.lineTo(W - 500, H); ctx.lineTo(W, H - 500); ctx.fill();
    return base(a, { ink: "#fafaf9", muted: "#a8a29e", eventColor: a, titleFont: CINZEL, titleWeight: "700", titleTracking: 18, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, sealInk: "#000000" });
  },
  glassgrad(ctx, a) {
    const g = ctx.createLinearGradient(0, 0, W, H); g.addColorStop(0, mix(a, "#ffffff", 0.2)); g.addColorStop(1, mix(a, "#ec4899", 0.6));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = rgba("#ffffff", 0.18); ctx.beginPath(); ctx.arc(300, 300, 400, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(W - 200, H - 150, 500, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = rgba("#ffffff", 0.82); roundRect(ctx, 160, 140, W - 320, H - 280, 60); ctx.fill();
    return base(a, { ink: "#111827", muted: "#4b5563", titleFont: GROTESK, titleWeight: "700", titleTracking: 12, nameFont: GROTESK, nameWeight: "700", nameSize: 160 });
  },
  blueprint(ctx, a) {
    ctx.fillStyle = "#0b3d91"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba("#ffffff", 0.08); ctx.lineWidth = 1; for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = rgba("#ffffff", 0.2); for (let x = 0; x < W; x += 200) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); } for (let y = 0; y < H; y += 200) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    frame(ctx, 80, rgba("#ffffff", 0.7), 3);
    ctx.strokeStyle = rgba(a, 0.6); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(W - 330, 330, 150, 0, Math.PI * 2); ctx.stroke(); ctx.beginPath(); ctx.moveTo(W - 520, 330); ctx.lineTo(W - 140, 330); ctx.moveTo(W - 330, 140); ctx.lineTo(W - 330, 520); ctx.stroke();
    return base(a, { ink: "#ffffff", muted: "#bfdbfe", eventColor: a, ruleColor: a, titleFont: MONO, titleWeight: "700", titleTracking: 14, nameFont: GROTESK, nameWeight: "700", nameSize: 150, bodyFont: MANROPE, labelFont: MONO, sealInk: "#0b3d91" });
  },
  indian(ctx, a) {
    ctx.fillStyle = "#fff7ed"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 90); ctx.fillRect(0, H - 90, W, 90);
    ctx.fillStyle = "#f59e0b"; for (let x = 0; x < W; x += 60) { ctx.beginPath(); ctx.moveTo(x, 90); ctx.lineTo(x + 30, 130); ctx.lineTo(x + 60, 90); ctx.fill(); ctx.beginPath(); ctx.moveTo(x, H - 90); ctx.lineTo(x + 30, H - 130); ctx.lineTo(x + 60, H - 90); ctx.fill(); }
    for (const [cx, cy] of [[250, H / 2], [W - 250, H / 2]] as const) for (let i = 0; i < 16; i++) {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate((Math.PI * 2 * i) / 16); ctx.fillStyle = rgba(i % 2 ? a : "#f59e0b", 0.35); ctx.beginPath(); ctx.ellipse(0, -110, 30, 90, 0, 0, Math.PI * 2); ctx.fill(); ctx.restore();
    }
    return base(a, { ink: "#431407", muted: "#9a3412", titleFont: CINZEL, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, bodyFont: GARAMOND, top: 300 });
  },
  kids(ctx, a) {
    ctx.fillStyle = "#fffbeb"; ctx.fillRect(0, 0, W, H);
    const r = rand(11); const cols = ["#f43f5e", "#22c55e", "#3b82f6", "#f59e0b", "#a855f7"];
    for (let i = 0; i < 40; i++) { const x = r() * W, y = r() * H; if (x > 300 && x < W - 300 && y > 250 && y < H - 250) continue; star(ctx, x, y, 20 + r() * 40, cols[i % 5]!); }
    ctx.strokeStyle = a; ctx.lineWidth = 16; ctx.setLineDash([40, 24]); roundRect(ctx, 90, 90, W - 180, H - 180, 60); ctx.stroke(); ctx.setLineDash([]);
    return base(a, { ink: "#1e1b4b", muted: "#4338ca", titleFont: MONT, titleWeight: "900", titleTracking: 6, nameFont: MONT, nameWeight: "800", nameSize: 160, bodyFont: MANROPE, labelFont: MONT });
  },
  jersey(ctx, a) {
    ctx.fillStyle = "#111827"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; for (let i = 0; i < 3; i++) ctx.fillRect(0, H - 260 + i * 70, W, 34);
    ctx.fillStyle = rgba("#ffffff", 0.04); ctx.font = `900 900px ${MONT}`; ctx.textAlign = "right"; ctx.textBaseline = "middle"; ctx.fillText("01", W - 80, H / 2 - 40);
    return base(a, { align: "left", left: 220, ink: "#ffffff", muted: "#9ca3af", titleFont: MONT, titleWeight: "900", titleTracking: 12, nameFont: MONT, nameWeight: "900", nameSize: 170, labelFont: MONT, sealInk: "#111827", top: 260 });
  },
  esports(ctx, a) {
    ctx.fillStyle = "#05010f"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(a, 0.25); ctx.lineWidth = 2;
    for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(W / 2, H * 0.62); ctx.lineTo((W / 29) * i * 2 - W / 2, H); ctx.stroke(); }
    for (let y = H * 0.62; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y + (y - H * 0.62) * 0.4); ctx.lineTo(W, y + (y - H * 0.62) * 0.4); ctx.stroke(); }
    ctx.shadowColor = a; ctx.shadowBlur = 40; ctx.strokeStyle = a; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.moveTo(80, 200); ctx.lineTo(80, 80); ctx.lineTo(200, 80); ctx.moveTo(W - 200, 80); ctx.lineTo(W - 80, 80); ctx.lineTo(W - 80, 200); ctx.moveTo(80, H - 200); ctx.lineTo(80, H - 80); ctx.lineTo(200, H - 80); ctx.moveTo(W - 200, H - 80); ctx.lineTo(W - 80, H - 80); ctx.lineTo(W - 80, H - 200); ctx.stroke();
    ctx.shadowBlur = 0;
    return base(a, { ink: "#ffffff", muted: "#c4b5fd", titleFont: GROTESK, titleWeight: "700", titleTracking: 20, nameFont: GROTESK, nameWeight: "700", nameSize: 170, labelFont: MONO, sealInk: "#05010f" });
  },
  internship(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 160);
    text(ctx, "INTERNSHIP PROGRAMME", 200, 80, `700 40px ${MONT}`, "#ffffff", "left", undefined, 8);
    ctx.fillStyle = rgba(a, 0.06); ctx.fillRect(0, H - 120, W, 120);
    ctx.fillStyle = a; ctx.fillRect(160, 260, 10, H - 520);
    return base(a, { align: "left", left: 260, top: 340, ink: "#0f172a", muted: "#475569", titleFont: MONT, titleWeight: "800", titleTracking: 6, nameFont: SERIF, nameWeight: "700", nameSize: 140, labelFont: MONT });
  },
};

const extra2: typeof RENDERERS = {
  royal(ctx, a) {
    ctx.fillStyle = "#1a0f2e"; ctx.fillRect(0, 0, W, H);
    const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W); g.addColorStop(0, rgba(a, 0.15)); g.addColorStop(1, rgba(a, 0));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = a; ctx.lineWidth = 3; frame(ctx, 60, a, 3); frame(ctx, 84, rgba(a, 0.5), 1);
    for (const [cx, cy] of [[60, 60], [W - 60, 60], [60, H - 60], [W - 60, H - 60]] as const) {
      ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(cx, cy - 34); ctx.lineTo(cx + 20, cy); ctx.lineTo(cx, cy + 34); ctx.lineTo(cx - 20, cy); ctx.closePath(); ctx.fill();
    }
    ctx.strokeStyle = rgba(a, 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W / 2 - 300, 210); ctx.lineTo(W / 2 + 300, 210); ctx.stroke();
    ctx.fillStyle = a; ctx.beginPath(); ctx.moveTo(W / 2, 190); ctx.lineTo(W / 2 + 16, 210); ctx.lineTo(W / 2, 230); ctx.lineTo(W / 2 - 16, 210); ctx.closePath(); ctx.fill();
    return base(a, { ink: "#f5f3ff", muted: mix(a, "#ffffff", 0.4), eventColor: a, titleFont: CINZEL, titleWeight: "700", titleTracking: 22, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, sealInk: "#1a0f2e" });
  },
  nordic(ctx, a) {
    ctx.fillStyle = "#f4f4f5"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(140, 220, 14, 240);
    ctx.fillStyle = rgba(a, 0.08); ctx.beginPath(); ctx.arc(W - 420, H - 380, 380, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = rgba("#18181b", 0.12); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(140, H - 260); ctx.lineTo(W - 140, H - 260); ctx.stroke();
    return base(a, { align: "left", left: 240, top: 300, ink: "#18181b", muted: "#71717a", titleFont: GROTESK, titleWeight: "300", titleTracking: 26, nameFont: GROTESK, nameWeight: "600", nameSize: 150, bodyFont: MANROPE, labelFont: MONT });
  },
  retrowave(ctx, a) {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#1e1b4b"); g.addColorStop(0.6, "#701a75"); g.addColorStop(1, "#0f0520");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sun = ctx.createLinearGradient(0, 240, 0, 720); sun.addColorStop(0, "#fde047"); sun.addColorStop(1, "#f472b6");
    ctx.fillStyle = sun; ctx.beginPath(); ctx.arc(W / 2, 720, 330, Math.PI, 0); ctx.fill();
    ctx.fillStyle = "#701a75"; for (let i = 0; i < 6; i++) ctx.fillRect(W / 2 - 330, 560 + i * 26, 660, 8);
    ctx.strokeStyle = rgba("#22d3ee", 0.4); ctx.lineWidth = 2;
    for (let i = -8; i <= 8; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 60, 720); ctx.lineTo(W / 2 + i * 260, H); ctx.stroke(); }
    for (let y = 720; y < H; y += 42) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ctx.strokeStyle = a; ctx.lineWidth = 2; frame(ctx, 70, rgba(a, 0.6), 2);
    return base(a, { ink: "#ffffff", muted: "#f0abfc", eventColor: "#22d3ee", titleFont: MONT, titleWeight: "900", titleTracking: 18, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, labelFont: MONO, sealInk: "#1e1b4b", top: 300 });
  },
  hologram(ctx, a) {
    ctx.fillStyle = "#0a0a0f"; ctx.fillRect(0, 0, W, H);
    const r = rand(21);
    for (let i = 0; i < 24; i++) {
      const x = r() * W, y = r() * H, rad = 60 + r() * 220;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, rgba(["#22d3ee", "#a855f7", "#f472b6", a][i % 4]!, 0.14)); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.strokeStyle = rgba("#ffffff", 0.06); ctx.lineWidth = 1; for (let y = 0; y < H; y += 6) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const holo = ctx.createLinearGradient(0, 0, W, 0); holo.addColorStop(0, "#22d3ee"); holo.addColorStop(0.5, "#a855f7"); holo.addColorStop(1, "#f472b6");
    ctx.strokeStyle = holo; ctx.lineWidth = 3; ctx.strokeRect(90, 90, W - 180, H - 180);
    return base(a, { ink: "#ffffff", muted: "#a5b4fc", eventColor: "#22d3ee", titleFont: GROTESK, titleWeight: "700", titleTracking: 16, nameFont: GROTESK, nameWeight: "700", nameSize: 160, labelFont: MONO, sealInk: "#0a0a0f" });
  },
  chalkboard(ctx, a) {
    ctx.fillStyle = "#1f2937"; ctx.fillRect(0, 0, W, H);
    const r = rand(31); for (let i = 0; i < 2200; i++) { ctx.fillStyle = rgba("#ffffff", r() * 0.05); ctx.fillRect(r() * W, r() * H, 2, 2); }
    ctx.fillStyle = "#78350f"; ctx.fillRect(0, 0, W, 46); ctx.fillRect(0, H - 46, W, 46); ctx.fillRect(0, 0, 46, H); ctx.fillRect(W - 46, 0, 46, H);
    ctx.strokeStyle = rgba("#ffffff", 0.75); ctx.lineWidth = 3; ctx.setLineDash([14, 10]); ctx.strokeRect(90, 90, W - 180, H - 180); ctx.setLineDash([]);
    ctx.strokeStyle = rgba(a, 0.8); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(W / 2 - 260, 240); ctx.quadraticCurveTo(W / 2, 200, W / 2 + 260, 240); ctx.stroke();
    return base(a, { ink: "#f9fafb", muted: "#d1d5db", eventColor: a, titleFont: GARAMOND, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT, sealInk: "#1f2937" });
  },
  geometric2(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    const cols = [a, mix(a, "#000000", 0.25), mix(a, "#ffffff", 0.55)];
    const r = rand(41);
    for (let i = 0; i < 26; i++) {
      const x = r() * W, y = r() * H, s = 60 + r() * 200;
      if (x > W * 0.28 && x < W * 0.72 && y > H * 0.28 && y < H * 0.78) continue;
      ctx.fillStyle = rgba(cols[i % 3]!, 0.5); ctx.beginPath();
      if (i % 3 === 0) { ctx.moveTo(x, y); ctx.lineTo(x + s, y); ctx.lineTo(x + s / 2, y - s * 0.86); }
      else if (i % 3 === 1) { ctx.arc(x, y, s / 2, 0, Math.PI * 2); }
      else { ctx.rect(x, y, s, s * 0.6); }
      ctx.fill();
    }
    ctx.fillStyle = "#ffffff"; ctx.fillRect(W * 0.2, H * 0.2, W * 0.6, H * 0.62);
    ctx.strokeStyle = a; ctx.lineWidth = 3; ctx.strokeRect(W * 0.2, H * 0.2, W * 0.6, H * 0.62);
    return base(a, { ink: "#111827", muted: "#6b7280", titleFont: MONT, titleWeight: "800", titleTracking: 14, nameFont: MONT, nameWeight: "700", nameSize: 150, labelFont: MONT });
  },
  vintagepaper(ctx, a) {
    ctx.fillStyle = "#e8dcc0"; ctx.fillRect(0, 0, W, H);
    const r = rand(51); for (let i = 0; i < 4000; i++) { ctx.fillStyle = rgba("#7c5a2e", r() * 0.07); ctx.fillRect(r() * W, r() * H, 3, 3); }
    const v = ctx.createRadialGradient(W / 2, H / 2, H / 3, W / 2, H / 2, W * 0.7); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(60,40,10,0.35)");
    ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(a, 0.75); ctx.lineWidth = 5; frame(ctx, 90, rgba(a, 0.75), 5); frame(ctx, 110, rgba(a, 0.4), 1.5);
    for (const [cx, cy] of [[90, 90], [W - 90, 90], [90, H - 90], [W - 90, H - 90]] as const) {
      ctx.fillStyle = a; ctx.beginPath(); ctx.arc(cx, cy, 18, 0, Math.PI * 2); ctx.fill();
    }
    ctx.globalAlpha = 0.08; ctx.font = `700 560px ${SERIF}`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = a; ctx.fillText("★", W / 2, H / 2 + 60); ctx.globalAlpha = 1;
    return base(a, { ink: "#3b2f17", muted: "#6b5732", titleFont: SERIF, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: LIBRE, labelFont: SERIF });
  },
  medical(ctx, a) {
    ctx.fillStyle = "#f0fdfa"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 120);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(W / 2 - 90, 30, 180, 60);
    ctx.fillStyle = a; ctx.fillRect(W / 2 - 14, 6, 28, 108); ctx.fillRect(W / 2 - 46, 46, 92, 28);
    ctx.strokeStyle = rgba(a, 0.3); ctx.lineWidth = 2; frame(ctx, 80, rgba(a, 0.5), 3); frame(ctx, 100, rgba(a, 0.25), 1);
    ctx.fillStyle = rgba(a, 0.05); for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.arc(200 + i * 340, H - 160, 70, 0, Math.PI * 2); ctx.fill(); }
    return base(a, { ink: "#134e4a", muted: "#0f766e", titleFont: MONT, titleWeight: "700", titleTracking: 12, nameFont: SERIF, nameWeight: "700", nameSize: 140, bodyFont: MANROPE, labelFont: MONT, top: 320 });
  },
  music(ctx, a) {
    ctx.fillStyle = "#0c0a09"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba("#fafaf9", 0.5); ctx.lineWidth = 2;
    for (let s = 0; s < 3; s++) for (let l = 0; l < 5; l++) { const y = 180 + s * 420 + l * 22; ctx.beginPath(); ctx.moveTo(120, y); ctx.lineTo(W - 120, y); ctx.stroke(); }
    const r = rand(61); ctx.fillStyle = a;
    for (let i = 0; i < 14; i++) { const x = 180 + r() * (W - 360), y = 200 + r() * (H - 400); ctx.save(); ctx.translate(x, y); ctx.rotate(-0.3); ctx.beginPath(); ctx.ellipse(0, 0, 22, 15, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillRect(18, -90, 5, 90); ctx.restore(); }
    return base(a, { ink: "#fafaf9", muted: "#a8a29e", eventColor: a, titleFont: CINZEL, titleWeight: "700", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, sealInk: "#0c0a09" });
  },
  eco(ctx, a) {
    ctx.fillStyle = "#f7fee7"; ctx.fillRect(0, 0, W, H);
    const r = rand(71);
    for (let i = 0; i < 30; i++) {
      const x = r() * W, y = r() * H, s = 30 + r() * 70;
      if (x > W * 0.3 && x < W * 0.7 && y > H * 0.3 && y < H * 0.75) continue;
      ctx.save(); ctx.translate(x, y); ctx.rotate(r() * Math.PI * 2);
      ctx.fillStyle = rgba(i % 2 ? a : "#65a30d", 0.3); ctx.beginPath(); ctx.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = rgba("#3f6212", 0.4); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-s, 0); ctx.lineTo(s, 0); ctx.stroke(); ctx.restore();
    }
    ctx.strokeStyle = a; ctx.lineWidth = 4; frame(ctx, 84, a, 4);
    return base(a, { ink: "#1a2e05", muted: "#4d7c0f", titleFont: GARAMOND, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, bodyFont: MANROPE, labelFont: MONT });
  },
  galaxy(ctx, a) {
    ctx.fillStyle = "#030014"; ctx.fillRect(0, 0, W, H);
    const r = rand(81);
    for (let i = 0; i < 500; i++) { ctx.fillStyle = rgba("#ffffff", 0.2 + r() * 0.8); const s = r() * 2.4; ctx.fillRect(r() * W, r() * H, s, s); }
    for (const [x, y, c] of [[300, 300, "#a855f7"], [W - 300, H - 260, "#22d3ee"], [W / 2, H / 2, a]] as const) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, 420); g.addColorStop(0, rgba(c, 0.25)); g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    ctx.strokeStyle = rgba(a, 0.7); ctx.lineWidth = 2; frame(ctx, 80, rgba(a, 0.7), 2);
    return base(a, { ink: "#ffffff", muted: "#c4b5fd", eventColor: "#22d3ee", titleFont: GROTESK, titleWeight: "600", titleTracking: 22, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONO, sealInk: "#030014" });
  },
  kente(ctx, a) {
    ctx.fillStyle = "#fffbeb"; ctx.fillRect(0, 0, W, H);
    const cols = [a, "#f59e0b", "#16a34a", "#dc2626", "#111827"];
    for (let i = 0; i < 24; i++) { ctx.fillStyle = cols[i % 5]!; ctx.fillRect(0, i * 8, W, 4); ctx.fillRect(0, H - i * 8 - 4, W, 4); ctx.fillRect(i * 8, 0, 4, H); ctx.fillRect(W - i * 8 - 4, 0, 4, H); }
    ctx.fillStyle = "#fffbeb"; ctx.fillRect(200, 200, W - 400, H - 400);
    ctx.strokeStyle = a; ctx.lineWidth = 4; ctx.strokeRect(200, 200, W - 400, H - 400);
    return base(a, { ink: "#1c1917", muted: "#78716c", titleFont: CINZEL, titleWeight: "700", titleTracking: 12, nameFont: SERIF, nameWeight: "700", nameSize: 150, bodyFont: GARAMOND, labelFont: MONT, top: 320 });
  },
};

Object.assign(RENDERERS, extra, extra2);
TEMPLATE_LIST.push(
  { id: "ivy", name: "Ivy Diploma", group: "Classic", accent: "#14532d" },
  { id: "government", name: "Official Seal", group: "Classic", accent: "#1e3a8a" },
  { id: "stamp", name: "Vintage Stamp", group: "Classic", accent: "#92400e" },
  { id: "corporate", name: "Corporate Blue", group: "Modern", accent: "#1d4ed8" },
  { id: "japanese", name: "Japanese Minimal", group: "Modern", accent: "#dc2626" },
  { id: "glassgrad", name: "Glass Gradient", group: "Modern", accent: "#6366f1" },
  { id: "internship", name: "Internship", group: "Modern", accent: "#0f766e" },
  { id: "blueprint", name: "Blueprint", group: "Tech", accent: "#fbbf24" },
  { id: "esports", name: "Esports Neon", group: "Tech", accent: "#a855f7" },
  { id: "artdeco", name: "Art Deco", group: "Premium", accent: "#d4af37" },
  { id: "blackgold", name: "Black & Gold", group: "Premium", accent: "#d4a843" },
  { id: "watercolor", name: "Watercolor", group: "Festive", accent: "#0891b2" },
  { id: "indian", name: "Indian Heritage", group: "Festive", accent: "#be123c" },
  { id: "kids", name: "School Stars", group: "Festive", accent: "#4f46e5" },
  { id: "olympic", name: "Olympic", group: "Sports", accent: "#ca8a04" },
  { id: "jersey", name: "Sports Jersey", group: "Sports", accent: "#ef4444" },
  { id: "royal", name: "Royal Purple", group: "Premium", accent: "#c4b5fd" },
  { id: "vintagepaper", name: "Aged Parchment", group: "Classic", accent: "#92400e" },
  { id: "kente", name: "Kente Heritage", group: "Festive", accent: "#b45309" },
  { id: "nordic", name: "Nordic Minimal", group: "Modern", accent: "#0e7490" },
  { id: "geometric2", name: "Geo Shapes", group: "Modern", accent: "#f97316" },
  { id: "medical", name: "Medical & Health", group: "Modern", accent: "#0d9488" },
  { id: "eco", name: "Eco Leaves", group: "Modern", accent: "#65a30d" },
  { id: "retrowave", name: "Retro Wave", group: "Tech", accent: "#f472b6" },
  { id: "hologram", name: "Hologram", group: "Tech", accent: "#22d3ee" },
  { id: "galaxy", name: "Galaxy", group: "Tech", accent: "#818cf8" },
  { id: "chalkboard", name: "Chalkboard", group: "Festive", accent: "#fbbf24" },
  { id: "music", name: "Music & Arts", group: "Festive", accent: "#f43f5e" },
);
