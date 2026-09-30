// 50 additional background painters. Side-effect import registers into RENDERERS + TEMPLATE_LIST.
import { H, W, RENDERERS, base, mix, rgba, roundRect, SERIF, GARAMOND, CINZEL, SCRIPT, GROTESK, MANROPE, MONO } from "./renderer";
import { TEMPLATE_LIST } from "./backgrounds";

type Ctx = CanvasRenderingContext2D;
const MONT = "'Montserrat', Arial, sans-serif";
const LIBRE = "'Libre Baskerville', Georgia, serif";
const PINYON = "'Pinyon Script', cursive";
const TAU = Math.PI * 2;

function fill(ctx: Ctx, c: string) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
function lin(ctx: Ctx, stops: string[], x0 = 0, y0 = 0, x1 = W, y1 = H) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  stops.forEach((s, i) => g.addColorStop(i / Math.max(1, stops.length - 1), s));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function rad(ctx: Ctx, x: number, y: number, r: number, c: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, c); g.addColorStop(1, rgba("#000000", 0));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function frame(ctx: Ctx, i: number, c: string, lw: number) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.strokeRect(i, i, W - i * 2, H - i * 2); }
function circle(ctx: Ctx, x: number, y: number, r: number, c: string) { ctx.fillStyle = c; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }
function ring(ctx: Ctx, x: number, y: number, r: number, c: string, lw: number) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke(); }
function poly(ctx: Ctx, pts: number[][], c: string) { ctx.fillStyle = c; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x!, y!) : ctx.moveTo(x!, y!))); ctx.closePath(); ctx.fill(); }
function star(ctx: Ctx, cx: number, cy: number, r: number, c: string, n = 5, inner = 0.45) {
  ctx.fillStyle = c; ctx.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = -Math.PI / 2 + (Math.PI * i) / n; const rr = i % 2 ? r * inner : r; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
  ctx.closePath(); ctx.fill();
}
function rand(seed: number) { let s = seed; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
const CORNERS = [[0, 0, 1, 1], [W, 0, -1, 1], [0, H, 1, -1], [W, H, -1, -1]] as const;
/** Ornamental scroll corner (L bracket with curls). */
function scrollCorners(ctx: Ctx, inset: number, len: number, c: string, lw: number) {
  ctx.strokeStyle = c; ctx.lineWidth = lw;
  for (const [cx, cy, sx, sy] of CORNERS) {
    const x = cx + sx * inset, y = cy + sy * inset;
    ctx.beginPath(); ctx.moveTo(x + sx * len, y); ctx.lineTo(x, y); ctx.lineTo(x, y + sy * len); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + sx * 40, y + sy * 40, 26, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + sx * len, y + sy * 14, 14, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(x + sx * 14, y + sy * len, 14, 0, TAU); ctx.stroke();
  }
}
function dots(ctx: Ctx, gap: number, r: number, c: string, x0 = 0, y0 = 0, x1 = W, y1 = H) { ctx.fillStyle = c; for (let x = x0; x <= x1; x += gap) for (let y = y0; y <= y1; y += gap) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); } }
function grid(ctx: Ctx, gap: number, c: string, lw = 1) { ctx.strokeStyle = c; ctx.lineWidth = lw; ctx.beginPath(); for (let x = 0; x <= W; x += gap) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y <= H; y += gap) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke(); }
function wave(ctx: Ctx, y: number, amp: number, len: number, c: string, bottom = true) {
  ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, bottom ? H : 0);
  for (let x = 0; x <= W; x += 10) ctx.lineTo(x, y + Math.sin(x / len) * amp);
  ctx.lineTo(W, bottom ? H : 0); ctx.closePath(); ctx.fill();
}
function laurel(ctx: Ctx, cx: number, cy: number, r: number, c: string) {
  ctx.fillStyle = c;
  for (const s of [-1, 1]) for (let i = 0; i < 9; i++) {
    const a = Math.PI / 2 + s * (0.35 + i * 0.26); const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
    ctx.save(); ctx.translate(x, y); ctx.rotate(a + s * 0.9); ctx.beginPath(); ctx.ellipse(0, 0, r * 0.2, r * 0.07, 0, 0, TAU); ctx.fill(); ctx.restore();
  }
}
function rosette(ctx: Ctx, cx: number, cy: number, r: number, c: string, n = 36) {
  ctx.strokeStyle = c; ctx.lineWidth = 1.5;
  for (let i = 0; i < n; i++) { const a = (TAU * i) / n; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * r / 2, cy + Math.sin(a) * r / 2, r / 2, 0, TAU); ctx.stroke(); }
}
function hex(ctx: Ctx, cx: number, cy: number, r: number) { ctx.beginPath(); for (let i = 0; i < 6; i++) { const a = Math.PI / 6 + (TAU * i) / 6; ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); } ctx.closePath(); }
function leaf(ctx: Ctx, x: number, y: number, len: number, rot: number, c: string) { ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(len * 0.5, -len * 0.3, len, 0); ctx.quadraticCurveTo(len * 0.5, len * 0.3, 0, 0); ctx.fill(); ctx.restore(); }
function flower(ctx: Ctx, x: number, y: number, r: number, c: string, center: string, petals = 6) {
  for (let i = 0; i < petals; i++) { const a = (TAU * i) / petals; ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x + Math.cos(a) * r * 0.6, y + Math.sin(a) * r * 0.6, r * 0.5, r * 0.28, a, 0, TAU); ctx.fill(); }
  circle(ctx, x, y, r * 0.28, center);
}

const DARK = { ink: "#f8fafc", muted: "#cbd5e1", sealInk: "#0f172a" };

const more: typeof RENDERERS = {
  // ─────────── CLASSIC ───────────
  heraldic(ctx, a) {
    fill(ctx, "#faf6ea"); frame(ctx, 60, a, 14); frame(ctx, 92, rgba(a, 0.5), 2); frame(ctx, 110, a, 3);
    ctx.globalAlpha = 0.07; ctx.fillStyle = a; ctx.beginPath(); const cx = W / 2, cy = H / 2 + 80;
    ctx.moveTo(cx - 330, cy - 380); ctx.lineTo(cx + 330, cy - 380); ctx.lineTo(cx + 330, cy); ctx.quadraticCurveTo(cx + 300, cy + 330, cx, cy + 440); ctx.quadraticCurveTo(cx - 300, cy + 330, cx - 330, cy); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;
    laurel(ctx, cx, cy, 520, rgba(a, 0.06));
    for (const [x, y] of [[110, 110], [W - 110, 110], [110, H - 110], [W - 110, H - 110]]) star(ctx, x!, y!, 30, a, 4, 0.35);
    return base(a, { ink: "#1c1917", muted: "#57534e", titleFont: CINZEL, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: LIBRE });
  },
  victorian(ctx, a) {
    fill(ctx, "#f4ecd8"); rad(ctx, W / 2, H / 2, 1500, rgba("#ffffff", 0.6));
    frame(ctx, 70, "#3f2d1c", 5); frame(ctx, 84, "#3f2d1c", 1.5);
    ctx.strokeStyle = rgba(a, 0.7); ctx.lineWidth = 2;
    for (let x = 140; x < W - 140; x += 44) { ctx.beginPath(); ctx.arc(x + 22, 120, 22, Math.PI, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(x + 22, H - 120, 22, 0, Math.PI); ctx.stroke(); }
    scrollCorners(ctx, 150, 220, "#3f2d1c", 3);
    return base(a, { ink: "#2a1d12", muted: "#6b5842", titleFont: SERIF, titleWeight: "700", titleTracking: 8, nameFont: PINYON, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: LIBRE, top: 300 });
  },
  copperplate(ctx, a) {
    fill(ctx, "#fdfcf8");
    ctx.strokeStyle = rgba(a, 0.14); ctx.lineWidth = 1;
    for (let i = -H; i < W; i += 14) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); }
    ctx.fillStyle = "#fdfcf8"; roundRect(ctx, 150, 150, W - 300, H - 300, 30); ctx.fill();
    ctx.strokeStyle = a; ctx.lineWidth = 4; roundRect(ctx, 150, 150, W - 300, H - 300, 30); ctx.stroke();
    ctx.lineWidth = 1.5; roundRect(ctx, 175, 175, W - 350, H - 350, 20); ctx.stroke();
    return base(a, { ink: "#111827", muted: "#4b5563", titleFont: LIBRE, titleWeight: "700", titleTracking: 10, nameFont: PINYON, nameWeight: "400", nameSize: 210, bodyFont: LIBRE, labelFont: LIBRE });
  },
  engraved(ctx, a) {
    fill(ctx, "#f7f7f2");
    for (let r = 60; r < 1600; r += 9) ring(ctx, W / 2, H / 2 + 60, r, rgba(a, r % 36 === 0 ? 0.1 : 0.045), 1);
    frame(ctx, 70, a, 8); frame(ctx, 96, a, 2);
    rosette(ctx, 200, 200, 90, rgba(a, 0.4), 24); rosette(ctx, W - 200, 200, 90, rgba(a, 0.4), 24);
    rosette(ctx, 200, H - 200, 90, rgba(a, 0.4), 24); rosette(ctx, W - 200, H - 200, 90, rgba(a, 0.4), 24);
    return base(a, { ink: "#0f172a", muted: "#475569", titleFont: SERIF, titleWeight: "700", titleTracking: 14, nameFont: SERIF, nameWeight: "600", nameSize: 150, bodyFont: LIBRE, labelFont: MONT });
  },
  oxford(ctx, a) {
    fill(ctx, "#fbf9f3"); ctx.fillStyle = a; ctx.fillRect(0, 0, W, 170); ctx.fillRect(0, H - 90, W, 90);
    ctx.fillStyle = mix(a, "#d4af37", 0.7); ctx.fillRect(0, 170, W, 10); ctx.fillRect(0, H - 100, W, 10);
    for (let i = 0; i < 3; i++) star(ctx, W / 2 - 80 + i * 80, 85, 24, "#d4af37");
    frame(ctx, 230, rgba(a, 0.25), 2);
    return base(a, { ink: "#1e1b4b", muted: "#57534e", titleFont: CINZEL, titleWeight: "700", titleTracking: 10, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, bodyFont: GARAMOND, labelFont: LIBRE, top: 330 });
  },
  scroll(ctx, a) {
    fill(ctx, mix(a, "#1c1917", 0.6));
    ctx.fillStyle = "#f3e7c9"; roundRect(ctx, 200, 120, W - 400, H - 240, 10); ctx.fill();
    for (const y of [120, H - 120]) { const g = ctx.createLinearGradient(0, y - 60, 0, y + 60); g.addColorStop(0, "#b08a4a"); g.addColorStop(0.5, "#f1d9a0"); g.addColorStop(1, "#7a5a2a"); ctx.fillStyle = g; roundRect(ctx, 150, y - 55, W - 300, 110, 55); ctx.fill(); circle(ctx, 150, y, 70, "#6b4b22"); circle(ctx, W - 150, y, 70, "#6b4b22"); }
    rad(ctx, W / 2, H / 2, 1200, rgba("#ffffff", 0.15));
    return base(a, { ink: "#3b2410", muted: "#7a5c3a", titleFont: CINZEL, titleWeight: "700", titleTracking: 10, nameFont: PINYON, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: LIBRE, top: 330 });
  },
  filigree(ctx, a) {
    fill(ctx, "#fffef9");
    ctx.strokeStyle = rgba(a, 0.55); ctx.lineWidth = 2;
    for (const [cx, cy, sx, sy] of CORNERS) for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.ellipse(cx + sx * 60, cy + sy * 60, 120 + i * 45, 40 + i * 18, sx * sy > 0 ? Math.PI / 4 : -Math.PI / 4, 0, TAU); ctx.stroke(); }
    frame(ctx, 120, a, 2); frame(ctx, 132, rgba(a, 0.4), 1);
    return base(a, { ink: "#1f2937", muted: "#6b7280", titleFont: GARAMOND, titleWeight: "700", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT });
  },
  baroque(ctx, a) {
    fill(ctx, "#1a120b"); rad(ctx, W / 2, H / 2, 1400, rgba(a, 0.18));
    const gold = "#d6b36a"; frame(ctx, 60, gold, 10); frame(ctx, 86, gold, 2);
    for (const [cx, cy, sx, sy] of CORNERS) for (let i = 0; i < 4; i++) { ctx.strokeStyle = rgba(gold, 0.8 - i * 0.15); ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(cx + sx * 86, cy + sy * 86, 90 + i * 40, sx > 0 ? (sy > 0 ? 0 : -Math.PI / 2) : (sy > 0 ? Math.PI / 2 : Math.PI), sx > 0 ? (sy > 0 ? Math.PI / 2 : 0) : (sy > 0 ? Math.PI : Math.PI * 1.5)); ctx.stroke(); }
    return base(gold, { ...DARK, ink: "#fbf3e0", muted: "#d6c7a1", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: LIBRE });
  },

  // ─────────── MODERN ───────────
  bauhaus(ctx, a) {
    fill(ctx, "#f5f0e6");
    circle(ctx, W - 260, 260, 180, "#e63946"); poly(ctx, [[W - 520, H], [W, H], [W, H - 520]], "#1d3557");
    ctx.fillStyle = "#f4a261"; ctx.fillRect(0, H - 260, 260, 260); ctx.fillStyle = a; ctx.fillRect(0, 0, 60, H - 260);
    return base(a, { align: "left", left: 300, ink: "#111111", muted: "#555555", titleFont: GROTESK, titleWeight: "700", titleTracking: 14, nameFont: GROTESK, nameWeight: "700", nameSize: 160, labelFont: GROTESK, bodyFont: MANROPE });
  },
  memphis(ctx, a) {
    fill(ctx, "#fffaf0"); const r = rand(7);
    for (let i = 0; i < 40; i++) {
      const edge = i % 4, x = edge === 0 ? r() * 260 : edge === 1 ? W - r() * 260 : r() * W, y = edge === 2 ? r() * 200 : edge === 3 ? H - r() * 200 : r() * H;
      if (edge < 2 || true) { const k = i % 3; const c = ["#ff6b6b", "#4ecdc4", "#ffd93d", a][i % 4]!; if (k === 0) circle(ctx, x, y, 18 + r() * 20, c); else if (k === 1) poly(ctx, [[x, y - 30], [x + 30, y + 24], [x - 30, y + 24]], c); else { ctx.strokeStyle = c; ctx.lineWidth = 8; ctx.beginPath(); for (let j = 0; j < 5; j++) ctx.lineTo(x + j * 20, y + (j % 2 ? 18 : -18)); ctx.stroke(); } }
    }
    ctx.fillStyle = "#fffaf0"; roundRect(ctx, 300, 230, W - 600, H - 460, 40); ctx.fill(); ctx.strokeStyle = "#111111"; ctx.lineWidth = 6; roundRect(ctx, 300, 230, W - 600, H - 460, 40); ctx.stroke();
    return base(a, { ink: "#111111", muted: "#444444", titleFont: GROTESK, titleWeight: "700", titleTracking: 10, nameFont: MONT, nameWeight: "900", nameSize: 150, labelFont: GROTESK, top: 330 });
  },
  duotone(ctx, a) {
    lin(ctx, [a, mix(a, "#000000", 0.55)]);
    ring(ctx, W - 200, H / 2, 700, rgba("#ffffff", 0.08), 120); ring(ctx, W - 200, H / 2, 450, rgba("#ffffff", 0.06), 60);
    return base("#ffffff", { ...DARK, align: "left", left: 240, sealInk: a, titleFont: MONT, titleWeight: "800", titleTracking: 16, nameFont: MONT, nameWeight: "800", nameSize: 160, labelFont: MONT, eventColor: "#ffffff", ruleColor: "#ffffff" });
  },
  pastelwave(ctx, a) {
    fill(ctx, "#fdf7ff");
    wave(ctx, 170, 40, 220, rgba(a, 0.25), false); wave(ctx, 120, 30, 160, rgba(mix(a, "#f9a8d4", 0.5), 0.35), false);
    wave(ctx, H - 180, 40, 240, rgba(a, 0.25)); wave(ctx, H - 120, 30, 170, rgba(mix(a, "#a5f3fc", 0.5), 0.4));
    return base(a, { ink: "#3b0764", muted: "#6b21a8", titleFont: MONT, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONT, top: 300 });
  },
  monoline(ctx, a) {
    fill(ctx, "#ffffff"); ctx.strokeStyle = "#111111"; ctx.lineWidth = 2;
    ctx.strokeRect(120, 120, W - 240, H - 240);
    for (const x of [120, W - 120]) { ctx.beginPath(); ctx.moveTo(x - 40, 120); ctx.lineTo(x + 40, 120); ctx.moveTo(x, 80); ctx.lineTo(x, 160); ctx.moveTo(x - 40, H - 120); ctx.lineTo(x + 40, H - 120); ctx.moveTo(x, H - 160); ctx.lineTo(x, H - 80); ctx.stroke(); }
    circle(ctx, W / 2, 120, 10, a);
    return base(a, { ink: "#111111", muted: "#6b7280", titleFont: MANROPE, titleWeight: "300", titleTracking: 30, nameFont: SERIF, nameWeight: "400", nameSize: 150, labelFont: MONO });
  },
  brutalist(ctx, a) {
    fill(ctx, "#eeeeea"); ctx.fillStyle = "#111111"; ctx.fillRect(0, 0, W, 110); ctx.fillRect(0, H - 110, W, 110);
    ctx.fillStyle = a; ctx.fillRect(W - 420, 110, 300, 300);
    ctx.strokeStyle = "#111111"; ctx.lineWidth = 10; ctx.strokeRect(80, 180, W - 160, H - 360);
    return base(a, { align: "left", left: 200, ink: "#111111", muted: "#333333", titleFont: MONO, titleWeight: "700", titleTracking: 6, nameFont: GROTESK, nameWeight: "700", nameSize: 170, labelFont: MONO, bodyFont: MONO, top: 320 });
  },
  editorial(ctx, a) {
    fill(ctx, "#fbfaf7"); ctx.fillStyle = "#111111"; ctx.fillRect(160, 160, W - 320, 4); ctx.fillRect(160, H - 164, W - 320, 4);
    ctx.fillRect(160, 176, W - 320, 1.5); ctx.fillRect(160, H - 178, W - 320, 1.5);
    ctx.fillStyle = rgba(a, 0.08); ctx.font = `700 900px ${SERIF}`; ctx.textAlign = "right"; ctx.textBaseline = "alphabetic"; ctx.fillText("№", W - 200, H - 240);
    return base(a, { align: "left", left: 260, ink: "#111111", muted: "#57534e", titleFont: SERIF, titleWeight: "700", titleTracking: 4, nameFont: SERIF, nameWeight: "400", nameSize: 170, bodyFont: GARAMOND, labelFont: MONT, top: 300 });
  },
  sidebar(ctx, a) {
    fill(ctx, "#ffffff"); lin(ctx, ["#ffffff", "#f8fafc"]);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, mix(a, "#000000", 0.45)); ctx.fillStyle = g; ctx.fillRect(W - 440, 0, 440, H);
    dots(ctx, 40, 4, rgba("#ffffff", 0.18), W - 400, 40, W - 40, H - 40);
    return base(a, { align: "left", left: 240, ink: "#0f172a", muted: "#64748b", titleFont: MONT, titleWeight: "800", titleTracking: 12, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONT });
  },
  diagonal(ctx, a) {
    fill(ctx, "#ffffff");
    poly(ctx, [[0, 0], [900, 0], [0, 620]], a); poly(ctx, [[0, 0], [1100, 0], [0, 760]], rgba(a, 0.2));
    poly(ctx, [[W, H], [W - 900, H], [W, H - 620]], a); poly(ctx, [[W, H], [W - 1100, H], [W, H - 760]], rgba(a, 0.2));
    return base(a, { ink: "#0f172a", muted: "#64748b", titleFont: MONT, titleWeight: "800", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONT });
  },
  arcs(ctx, a) {
    fill(ctx, "#f8f5f0");
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = rgba(a, 0.9 - i * 0.14); ctx.lineWidth = 36; ctx.beginPath(); ctx.arc(0, H, 260 + i * 60, -Math.PI / 2, 0); ctx.stroke(); ctx.beginPath(); ctx.arc(W, 0, 260 + i * 60, Math.PI / 2, Math.PI); ctx.stroke(); }
    return base(a, { ink: "#1c1917", muted: "#78716c", titleFont: MONT, titleWeight: "700", titleTracking: 16, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONT });
  },

  // ─────────── TECH ───────────
  matrix(ctx, a) {
    fill(ctx, "#020805"); const r = rand(11); ctx.font = `28px ${MONO}`; ctx.textAlign = "center";
    for (let x = 20; x < W; x += 36) { const len = 8 + Math.floor(r() * 30), y0 = r() * H; for (let j = 0; j < len; j++) { ctx.fillStyle = rgba(a, (j / len) * 0.35); ctx.fillText(String.fromCharCode(0x30a0 + Math.floor(r() * 90)), x, y0 + j * 34); } }
    ctx.fillStyle = rgba("#020805", 0.82); roundRect(ctx, 240, 200, W - 480, H - 400, 20); ctx.fill(); ctx.strokeStyle = rgba(a, 0.6); ctx.lineWidth = 2; roundRect(ctx, 240, 200, W - 480, H - 400, 20); ctx.stroke();
    return base(a, { ...DARK, ink: "#ecfdf5", muted: "#86efac", titleFont: MONO, titleWeight: "700", titleTracking: 10, nameFont: GROTESK, nameWeight: "700", nameSize: 150, bodyFont: MONO, labelFont: MONO, top: 320 });
  },
  terminal(ctx, a) {
    fill(ctx, "#0d1117"); ctx.fillStyle = "#161b22"; roundRect(ctx, 120, 100, W - 240, H - 200, 28); ctx.fill();
    ctx.fillStyle = "#21262d"; ctx.fillRect(120, 100, W - 240, 80); roundRect(ctx, 120, 100, W - 240, 80, 28); ctx.fill();
    circle(ctx, 180, 140, 14, "#ff5f57"); circle(ctx, 222, 140, 14, "#febc2e"); circle(ctx, 264, 140, 14, "#28c840");
    ctx.fillStyle = rgba(a, 0.5); ctx.font = `28px ${MONO}`; ctx.textAlign = "left"; ctx.fillText("~/certificates $ ./issue --verified", 180, H - 150);
    return base(a, { ...DARK, ink: "#e6edf3", muted: "#8b949e", titleFont: MONO, titleWeight: "700", titleTracking: 8, nameFont: GROTESK, nameWeight: "700", nameSize: 150, bodyFont: MONO, labelFont: MONO, top: 300 });
  },
  circuitgrid(ctx, a) {
    fill(ctx, "#06121f"); grid(ctx, 60, rgba(a, 0.06)); const r = rand(3);
    ctx.strokeStyle = rgba(a, 0.45); ctx.lineWidth = 3;
    for (let i = 0; i < 44; i++) { const side = i % 2, y = 100 + r() * (H - 200); const x0 = side ? W : 0, x1 = side ? W - 150 - r() * 250 : 150 + r() * 250; ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y); ctx.lineTo(x1 + (side ? -40 : 40), y - 40); ctx.stroke(); circle(ctx, x1 + (side ? -40 : 40), y - 40, 7, a); }
    return base(a, { ...DARK, ink: "#e0f2fe", muted: "#7dd3fc", titleFont: GROTESK, titleWeight: "700", titleTracking: 14, nameFont: GROTESK, nameWeight: "700", nameSize: 150, labelFont: MONO });
  },
  cyberpunk(ctx, a) {
    lin(ctx, ["#0b0014", "#1a0033", "#00111a"]);
    ctx.strokeStyle = rgba("#00f0ff", 0.5); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(80, 200); ctx.lineTo(80, 80); ctx.lineTo(500, 80); ctx.moveTo(W - 80, H - 200); ctx.lineTo(W - 80, H - 80); ctx.lineTo(W - 500, H - 80); ctx.stroke();
    ctx.fillStyle = a; poly(ctx, [[W - 600, 60], [W - 80, 60], [W - 80, 110], [W - 650, 110]], a);
    poly(ctx, [[80, H - 110], [650, H - 110], [600, H - 60], [80, H - 60]], rgba("#00f0ff", 0.8));
    for (let y = 0; y < H; y += 6) { ctx.fillStyle = rgba("#ffffff", 0.015); ctx.fillRect(0, y, W, 2); }
    return base(a, { ...DARK, ink: "#fdf4ff", muted: "#f0abfc", titleFont: GROTESK, titleWeight: "700", titleTracking: 18, nameFont: MONT, nameWeight: "900", nameSize: 160, labelFont: MONO, eventColor: "#00f0ff" });
  },
  datagrid(ctx, a) {
    fill(ctx, "#ffffff"); grid(ctx, 40, "#eef2f7"); grid(ctx, 200, "#dde3ea", 1.5);
    const r = rand(5); for (let i = 0; i < 26; i++) { const h = 40 + r() * 180; ctx.fillStyle = rgba(a, 0.2 + (i % 3) * 0.1); ctx.fillRect(160 + i * 84, H - 120 - h, 56, h); }
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 16);
    return base(a, { ink: "#0f172a", muted: "#64748b", titleFont: MANROPE, titleWeight: "800", titleTracking: 14, nameFont: MANROPE, nameWeight: "800", nameSize: 150, labelFont: MONO, top: 260 });
  },
  isometric(ctx, a) {
    fill(ctx, "#f8fafc"); ctx.strokeStyle = rgba(a, 0.1); ctx.lineWidth = 1.5;
    for (let i = -H * 2; i < W + H; i += 60) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H * 1.732, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i, H); ctx.lineTo(i + H * 1.732, 0); ctx.stroke(); }
    for (const [x, y, s] of [[260, 300, 1], [W - 300, H - 320, 1.3]] as const) { const k = 110 * s; poly(ctx, [[x, y - k], [x + k * 0.87, y - k / 2], [x, y], [x - k * 0.87, y - k / 2]], mix(a, "#ffffff", 0.3)); poly(ctx, [[x - k * 0.87, y - k / 2], [x, y], [x, y + k], [x - k * 0.87, y + k / 2]], a); poly(ctx, [[x + k * 0.87, y - k / 2], [x, y], [x, y + k], [x + k * 0.87, y + k / 2]], mix(a, "#000000", 0.3)); }
    return base(a, { ink: "#0f172a", muted: "#475569", titleFont: GROTESK, titleWeight: "700", titleTracking: 14, nameFont: GROTESK, nameWeight: "700", nameSize: 150, labelFont: MONO });
  },
  wireframe(ctx, a) {
    fill(ctx, "#030712"); ctx.strokeStyle = rgba(a, 0.35); ctx.lineWidth = 1.5;
    const hy = H * 0.72; for (let i = -30; i <= 30; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 20, hy); ctx.lineTo(W / 2 + i * 180, H); ctx.stroke(); }
    for (let k = 0; k < 12; k++) { const y = hy + Math.pow(k / 12, 2) * (H - hy); ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    ring(ctx, W / 2, hy, 260, rgba(a, 0.2), 2); ring(ctx, W / 2, hy, 200, rgba(a, 0.15), 2);
    return base(a, { ...DARK, titleFont: GROTESK, titleWeight: "700", titleTracking: 18, nameFont: GROTESK, nameWeight: "700", nameSize: 150, labelFont: MONO, top: 220 });
  },
  pixel(ctx, a) {
    fill(ctx, "#1e1b2e"); const s = 40, r = rand(9);
    for (let x = 0; x < W; x += s) for (let y = 0; y < H; y += s) { const edge = Math.min(x, y, W - x - s, H - y - s); if (edge < 200 && r() < 0.55 - edge / 500) { ctx.fillStyle = [a, "#22d3ee", "#facc15", "#f472b6"][Math.floor(r() * 4)]!; ctx.fillRect(x + 2, y + 2, s - 4, s - 4); } }
    return base(a, { ...DARK, titleFont: MONO, titleWeight: "700", titleTracking: 10, nameFont: GROTESK, nameWeight: "700", nameSize: 150, labelFont: MONO, bodyFont: MONO });
  },

  // ─────────── PREMIUM ───────────
  rosegold(ctx, a) {
    lin(ctx, ["#fff5f2", "#fde7e1", "#fff7f4"]);
    const g = ctx.createLinearGradient(0, 0, W, H); ["#b76e79", "#f4c4b8", "#b76e79", "#eab0a2", "#9c5a63"].forEach((c, i) => g.addColorStop(i / 4, c));
    ctx.strokeStyle = g; ctx.lineWidth = 14; ctx.strokeRect(80, 80, W - 160, H - 160); ctx.lineWidth = 3; ctx.strokeRect(116, 116, W - 232, H - 232);
    for (const [x, y] of [[116, 116], [W - 116, 116], [116, H - 116], [W - 116, H - 116]]) star(ctx, x!, y!, 36, "#b76e79", 4, 0.3);
    return base(a, { ink: "#4a2a2f", muted: "#8a5d63", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, labelFont: MONT });
  },
  platinum(ctx, a) {
    lin(ctx, ["#e5e7eb", "#f9fafb", "#d1d5db", "#f3f4f6"]);
    for (let i = 0; i < H; i += 3) { ctx.fillStyle = rgba("#ffffff", (i % 9) / 60); ctx.fillRect(0, i, W, 1); }
    ctx.fillStyle = "#111827"; ctx.fillRect(0, 0, W, 60); ctx.fillRect(0, H - 60, W, 60);
    frame(ctx, 110, "#6b7280", 2);
    return base(a, { ink: "#111827", muted: "#4b5563", titleFont: MONT, titleWeight: "300", titleTracking: 34, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONT, bodyFont: MANROPE });
  },
  sapphire(ctx, a) {
    lin(ctx, ["#0a1a3f", "#0f2f6b", "#081530"]); rad(ctx, W / 2, 0, 1300, rgba("#60a5fa", 0.18));
    const gold = "#e8c77a"; frame(ctx, 70, gold, 3); frame(ctx, 90, rgba(gold, 0.5), 1);
    for (let i = 0; i < 5; i++) { ctx.save(); ctx.translate(W / 2, H - 90); ctx.rotate(Math.PI / 4); ctx.strokeStyle = rgba(gold, 1 - i * 0.18); ctx.lineWidth = 2; ctx.strokeRect(-10 - i * 8, -10 - i * 8, 20 + i * 16, 20 + i * 16); ctx.restore(); }
    return base(gold, { ...DARK, ink: "#f8fafc", muted: "#bfdbfe", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT });
  },
  velvet(ctx, a) {
    lin(ctx, ["#3b0a1a", "#6b0f2a", "#2a0510"], 0, 0, 0, H);
    for (let x = 0; x < W; x += 120) { const g = ctx.createLinearGradient(x, 0, x + 120, 0); g.addColorStop(0, rgba("#000000", 0.18)); g.addColorStop(0.5, rgba("#ffffff", 0.04)); g.addColorStop(1, rgba("#000000", 0.18)); ctx.fillStyle = g; ctx.fillRect(x, 0, 120, H); }
    ctx.fillStyle = "#fbf4ea"; roundRect(ctx, 200, 160, W - 400, H - 320, 8); ctx.fill(); frame(ctx, 230, rgba("#b8860b", 0.7), 2);
    return base("#9f1239", { ink: "#2a0510", muted: "#6b4450", titleFont: CINZEL, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, bodyFont: GARAMOND, labelFont: LIBRE, top: 320 });
  },
  obsidian(ctx, a) {
    fill(ctx, "#09090b"); rad(ctx, 0, 0, 1400, rgba(a, 0.14)); rad(ctx, W, H, 1400, rgba(a, 0.1));
    ctx.strokeStyle = rgba(a, 0.3); ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(W - 900 + i * 60, 0); ctx.lineTo(W, 900 - i * 60); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, H - 900 + i * 60); ctx.lineTo(900 - i * 60, H); ctx.stroke(); }
    return base(a, { ...DARK, ink: "#fafafa", muted: "#a1a1aa", titleFont: MONT, titleWeight: "600", titleTracking: 28, nameFont: SERIF, nameWeight: "500", nameSize: 150, labelFont: MONT });
  },
  champagne(ctx, a) {
    lin(ctx, ["#fbf3e2", "#f3e2c0", "#fbf3e2"]);
    const r = rand(21); for (let i = 0; i < 160; i++) { const x = r() * W, y = r() * H; if (Math.abs(x - W / 2) < 900 && Math.abs(y - H / 2) < 560) continue; ring(ctx, x, y, 4 + r() * 18, rgba("#b8903f", 0.25 + r() * 0.3), 2); }
    frame(ctx, 110, "#b8903f", 2);
    return base("#a47a2c", { ink: "#3d2f14", muted: "#7a6536", titleFont: CINZEL, titleWeight: "600", titleTracking: 16, nameFont: PINYON, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, labelFont: MONT });
  },
  emeraldlux(ctx, a) {
    lin(ctx, ["#022c22", "#064e3b", "#011a14"]);
    ctx.strokeStyle = rgba("#d4af37", 0.12); ctx.lineWidth = 2; for (let x = 0; x < W + 100; x += 100) for (let y = 0; y < H + 100; y += 100) { ctx.beginPath(); ctx.moveTo(x, y - 50); ctx.lineTo(x + 50, y); ctx.lineTo(x, y + 50); ctx.lineTo(x - 50, y); ctx.closePath(); ctx.stroke(); }
    ctx.fillStyle = "#022c22"; roundRect(ctx, 180, 160, W - 360, H - 320, 12); ctx.fill(); frame(ctx, 180, "#d4af37", 3);
    return base("#d4af37", { ...DARK, ink: "#ecfdf5", muted: "#a7f3d0", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT, top: 310 });
  },
  bronze(ctx, a) {
    fill(ctx, "#f6efe6"); const g = ctx.createLinearGradient(0, 0, W, 0); ["#6b3f1d", "#c98a4b", "#8a5428", "#d9a066", "#6b3f1d"].forEach((c, i) => g.addColorStop(i / 4, c));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, 90); ctx.fillRect(0, H - 90, W, 90); ctx.fillRect(0, 0, 40, H); ctx.fillRect(W - 40, 0, 40, H);
    laurel(ctx, W / 2, H / 2 + 60, 560, rgba("#8a5428", 0.07));
    return base("#8a5428", { ink: "#2b1a0c", muted: "#6b5440", titleFont: SERIF, titleWeight: "700", titleTracking: 12, nameFont: SERIF, nameWeight: "600", nameSize: 150, bodyFont: LIBRE, labelFont: MONT });
  },

  // ─────────── FESTIVE ───────────
  diwali(ctx, a) {
    lin(ctx, ["#2a0a3d", "#4a1260", "#1a0626"]);
    for (let i = 0; i < 9; i++) { const x = 180 + i * ((W - 360) / 8), y = H - 120; ctx.fillStyle = "#b45309"; ctx.beginPath(); ctx.ellipse(x, y, 60, 26, 0, 0, Math.PI); ctx.fill(); rad(ctx, x, y - 50, 120, rgba("#fbbf24", 0.25)); ctx.fillStyle = "#fde047"; ctx.beginPath(); ctx.ellipse(x, y - 30, 12, 30, 0, 0, TAU); ctx.fill(); }
    for (let i = 0; i < 18; i++) { const x = 100 + i * ((W - 200) / 17); ctx.strokeStyle = rgba("#fbbf24", 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 60 + (i % 3) * 30); ctx.stroke(); star(ctx, x, 72 + (i % 3) * 30, 14, "#fbbf24"); }
    return base("#fbbf24", { ...DARK, ink: "#fff7ed", muted: "#fed7aa", titleFont: CINZEL, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT, top: 290 });
  },
  holi(ctx, a) {
    fill(ctx, "#ffffff"); const cols = ["#ec4899", "#f59e0b", "#22c55e", "#3b82f6", "#a855f7", "#ef4444"]; const r = rand(13);
    for (let i = 0; i < 26; i++) { const c = cols[i % 6]!, corner = CORNERS[i % 4]!; const x = corner[0] + corner[2] * r() * 600, y = corner[1] + corner[3] * r() * 420; rad(ctx, x, y, 160 + r() * 200, rgba(c, 0.45)); }
    return base(a, { ink: "#1f2937", muted: "#6b7280", titleFont: MONT, titleWeight: "800", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, labelFont: MONT });
  },
  christmas(ctx, a) {
    fill(ctx, "#fffdf8"); ctx.fillStyle = "#14532d"; ctx.fillRect(0, 0, W, 130); ctx.fillRect(0, H - 130, W, 130);
    for (let x = 0; x < W; x += 60) { ctx.fillStyle = x % 120 ? "#b91c1c" : "#fffdf8"; ctx.fillRect(x, 130, 60, 16); ctx.fillRect(x, H - 146, 60, 16); }
    const r = rand(25); for (let i = 0; i < 40; i++) star(ctx, r() * W, r() * 110 + 10, 6 + r() * 10, rgba("#ffffff", 0.8), 6, 0.4);
    for (const x of [200, W - 200]) { poly(ctx, [[x, H - 540], [x + 130, H - 180], [x - 130, H - 180]], rgba("#14532d", 0.15)); star(ctx, x, H - 560, 30, rgba("#ca8a04", 0.5)); }
    return base("#b91c1c", { ink: "#14532d", muted: "#4b5563", titleFont: CINZEL, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT, top: 300 });
  },
  newyear(ctx, a) {
    lin(ctx, ["#0b1026", "#1b1446", "#0b1026"]);
    const burst = (cx: number, cy: number, r: number, c: string) => { for (let i = 0; i < 28; i++) { const t = (TAU * i) / 28; ctx.strokeStyle = rgba(c, 0.7); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cx + Math.cos(t) * r * 0.3, cy + Math.sin(t) * r * 0.3); ctx.lineTo(cx + Math.cos(t) * r, cy + Math.sin(t) * r); ctx.stroke(); circle(ctx, cx + Math.cos(t) * r, cy + Math.sin(t) * r, 5, c); } };
    burst(280, 300, 200, "#fbbf24"); burst(W - 300, 260, 170, "#f472b6"); burst(W - 520, H - 280, 130, "#22d3ee"); burst(360, H - 260, 120, "#a78bfa");
    return base("#fbbf24", { ...DARK, titleFont: MONT, titleWeight: "800", titleTracking: 18, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONT });
  },
  balloons(ctx, a) {
    lin(ctx, ["#eff6ff", "#fdf2f8"]);
    const cols = ["#f43f5e", "#f59e0b", "#10b981", "#3b82f6", "#a855f7", a];
    const b = (x: number, y: number, c: string) => { ctx.strokeStyle = rgba("#475569", 0.5); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x, y + 90); ctx.quadraticCurveTo(x + 30, y + 200, x, y + 300); ctx.stroke(); ctx.fillStyle = c; ctx.beginPath(); ctx.ellipse(x, y, 70, 88, 0, 0, TAU); ctx.fill(); ctx.fillStyle = rgba("#ffffff", 0.35); ctx.beginPath(); ctx.ellipse(x - 24, y - 30, 14, 24, -0.4, 0, TAU); ctx.fill(); };
    [[180, 300], [320, 220], [240, 480], [W - 180, 320], [W - 330, 230], [W - 250, 500]].forEach(([x, y], i) => b(x!, y!, cols[i % 6]!));
    return base(a, { ink: "#1e293b", muted: "#64748b", titleFont: MONT, titleWeight: "800", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONT });
  },
  floral(ctx, a) {
    fill(ctx, "#fffaf7"); const r = rand(31);
    for (const [cx, cy, sx, sy] of CORNERS) for (let i = 0; i < 14; i++) { const d = r() * 380, t = r() * Math.PI / 2; const x = cx + sx * Math.cos(t) * d, y = cy + sy * Math.sin(t) * d; if (i % 2) leaf(ctx, x, y, 90, r() * TAU, rgba("#4d7c0f", 0.55)); else flower(ctx, x, y, 40 + r() * 30, rgba(a, 0.7), "#fde68a", 5 + (i % 3)); }
    return base(a, { ink: "#3f1d2b", muted: "#7c5561", titleFont: GARAMOND, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, labelFont: MONT });
  },
  origami(ctx, a) {
    fill(ctx, "#fafaf9"); const tones = [a, mix(a, "#ffffff", 0.3), mix(a, "#000000", 0.25), mix(a, "#ffffff", 0.55)];
    const tri = (pts: number[][], i: number) => poly(ctx, pts, tones[i % 4]!);
    tri([[0, 0], [420, 0], [0, 320]], 0); tri([[420, 0], [0, 320], [300, 380]], 1); tri([[0, 320], [300, 380], [0, 560]], 2); tri([[420, 0], [620, 0], [300, 380]], 3);
    tri([[W, H], [W - 420, H], [W, H - 320]], 0); tri([[W - 420, H], [W, H - 320], [W - 300, H - 380]], 1); tri([[W, H - 320], [W - 300, H - 380], [W, H - 560]], 2); tri([[W - 420, H], [W - 620, H], [W - 300, H - 380]], 3);
    return base(a, { ink: "#1c1917", muted: "#78716c", titleFont: MONT, titleWeight: "700", titleTracking: 16, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONT });
  },
  sunburst(ctx, a) {
    fill(ctx, mix(a, "#ffffff", 0.85)); ctx.save(); ctx.translate(W / 2, H / 2 + 60);
    for (let i = 0; i < 48; i++) { ctx.fillStyle = i % 2 ? rgba(a, 0.12) : rgba(a, 0.04); ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, 2000, (TAU * i) / 48, (TAU * (i + 1)) / 48); ctx.closePath(); ctx.fill(); }
    ctx.restore(); rad(ctx, W / 2, H / 2 + 60, 900, rgba("#ffffff", 0.9)); frame(ctx, 80, a, 6);
    return base(a, { ink: "#1c1917", muted: "#57534e", titleFont: MONT, titleWeight: "900", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, labelFont: MONT });
  },

  // ─────────── SPORTS ───────────
  track(ctx, a) {
    fill(ctx, "#fff7ed");
    for (let i = 0; i < 6; i++) { ctx.strokeStyle = i % 2 ? "#ffffff" : "#c2410c"; ctx.lineWidth = 34; ctx.beginPath(); ctx.ellipse(W / 2, H / 2, W / 2 + 200 - i * 34, H / 2 + 120 - i * 34, 0, 0, TAU); ctx.stroke(); }
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(W - 300, 0); ctx.lineTo(W - 300, 200); ctx.stroke();
    return base(a, { ink: "#1c1917", muted: "#57534e", titleFont: MONT, titleWeight: "900", titleTracking: 16, nameFont: MONT, nameWeight: "800", nameSize: 150, labelFont: MONT, top: 300 });
  },
  football(ctx, a) {
    fill(ctx, "#166534"); for (let x = 0; x < W; x += 200) { ctx.fillStyle = rgba("#ffffff", x % 400 ? 0.03 : 0); ctx.fillRect(x, 0, 200, H); }
    ctx.strokeStyle = rgba("#ffffff", 0.35); ctx.lineWidth = 6; ctx.strokeRect(80, 80, W - 160, H - 160);
    ctx.beginPath(); ctx.moveTo(W / 2, 80); ctx.lineTo(W / 2, H - 80); ctx.stroke(); ring(ctx, W / 2, H / 2, 240, rgba("#ffffff", 0.35), 6);
    ctx.strokeRect(80, H / 2 - 360, 300, 720); ctx.strokeRect(W - 380, H / 2 - 360, 300, 720);
    ctx.fillStyle = rgba("#052e16", 0.72); roundRect(ctx, 460, 200, W - 920, H - 400, 30); ctx.fill();
    return base("#facc15", { ...DARK, ink: "#f0fdf4", muted: "#bbf7d0", titleFont: MONT, titleWeight: "900", titleTracking: 14, nameFont: MONT, nameWeight: "800", nameSize: 140, labelFont: MONT, top: 320 });
  },
  basketball(ctx, a) {
    fill(ctx, "#e8b27a"); for (let x = 0; x < W; x += 90) { ctx.fillStyle = rgba("#7c4a1e", x % 180 ? 0.05 : 0.1); ctx.fillRect(x, 0, 90, H); }
    ctx.strokeStyle = rgba("#ffffff", 0.7); ctx.lineWidth = 8; ctx.beginPath(); ctx.arc(0, H / 2, 700, -Math.PI / 2, Math.PI / 2); ctx.stroke(); ctx.beginPath(); ctx.arc(W, H / 2, 700, Math.PI / 2, Math.PI * 1.5); ctx.stroke();
    ctx.fillStyle = rgba("#fff7ed", 0.9); roundRect(ctx, 520, 180, W - 1040, H - 360, 24); ctx.fill();
    return base("#c2410c", { ink: "#1c1917", muted: "#57534e", titleFont: MONT, titleWeight: "900", titleTracking: 14, nameFont: MONT, nameWeight: "800", nameSize: 130, labelFont: MONT, top: 300 });
  },
  chess(ctx, a) {
    fill(ctx, "#fafaf9"); const s = 70;
    for (let x = 0; x < W; x += s) for (let y = 0; y < H; y += s) { const edge = x < 210 || x >= W - 210 || y < 140 || y >= H - 140; if (edge && ((x / s + y / s) % 2 === 0)) { ctx.fillStyle = "#1c1917"; ctx.fillRect(x, y, s, s); } }
    frame(ctx, 230, a, 3);
    return base(a, { ink: "#1c1917", muted: "#57534e", titleFont: SERIF, titleWeight: "700", titleTracking: 14, nameFont: SERIF, nameWeight: "600", nameSize: 140, bodyFont: LIBRE, labelFont: MONT, top: 320 });
  },

  // ─────────── COURSE ───────────
  codecamp(ctx, a) {
    fill(ctx, "#ffffff"); ctx.fillStyle = "#0f172a"; ctx.fillRect(0, 0, 360, H);
    ctx.font = `26px ${MONO}`; ctx.textAlign = "left"; const lines = ["const you = {", "  skill: 'up',", "  done: true", "};", "", "ship(you);", "// 🎓"];
    lines.forEach((l, i) => { ctx.fillStyle = i % 3 === 1 ? rgba(a, 0.9) : rgba("#94a3b8", 0.7); ctx.fillText(l, 50, 200 + i * 44); });
    ctx.fillStyle = a; ctx.fillRect(360, 0, 12, H);
    return base(a, { align: "left", left: 520, ink: "#0f172a", muted: "#64748b", titleFont: GROTESK, titleWeight: "700", titleTracking: 10, nameFont: GROTESK, nameWeight: "700", nameSize: 140, labelFont: MONO });
  },
  science(ctx, a) {
    fill(ctx, "#f8fafc");
    for (let i = 0; i < 3; i++) { ctx.save(); ctx.translate(W - 300, 300); ctx.rotate((Math.PI / 3) * i); ctx.strokeStyle = rgba(a, 0.3); ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(0, 0, 220, 80, 0, 0, TAU); ctx.stroke(); ctx.restore(); }
    circle(ctx, W - 300, 300, 26, rgba(a, 0.6));
    ctx.strokeStyle = rgba(a, 0.18); ctx.lineWidth = 3; for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { hex(ctx, 200 + i * 104 + (j % 2) * 52, H - 380 + j * 90, 60); ctx.stroke(); }
    return base(a, { ink: "#0f172a", muted: "#475569", titleFont: MANROPE, titleWeight: "800", titleTracking: 16, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONO });
  },
  library(ctx, a) {
    fill(ctx, "#fbf7ef"); const r = rand(41); let x = 0;
    while (x < W) { const w = 30 + r() * 40, h = 120 + r() * 60; ctx.fillStyle = [a, "#7c2d12", "#1e3a8a", "#365314", "#78350f"][Math.floor(r() * 5)]!; ctx.fillRect(x, H - h, w - 4, h); ctx.fillStyle = rgba("#ffffff", 0.35); ctx.fillRect(x + 4, H - h + 20, w - 12, 4); x += w; }
    ctx.fillStyle = "#3f2d1c"; ctx.fillRect(0, H - 200, W, 12);
    frame(ctx, 90, rgba(a, 0.4), 2);
    return base(a, { ink: "#2a1d12", muted: "#6b5842", titleFont: LIBRE, titleWeight: "700", titleTracking: 10, nameFont: SCRIPT, nameWeight: "400", nameSize: 190, bodyFont: GARAMOND, labelFont: LIBRE, top: 260 });
  },
  math(ctx, a) {
    fill(ctx, "#ffffff"); grid(ctx, 32, "#e0f2fe"); grid(ctx, 160, "#bae6fd", 1.5);
    ctx.font = `italic 44px ${GARAMOND}`; ctx.fillStyle = rgba(a, 0.35); ctx.textAlign = "left";
    [["e^{iπ} + 1 = 0", 140, 170], ["∫ f(x) dx", W - 460, 180], ["a² + b² = c²", 140, H - 130], ["Σ 1/n²  = π²/6", W - 560, H - 130]].forEach(([t, x, y]) => ctx.fillText(t as string, x as number, y as number));
    ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(110, 0); ctx.lineTo(110, H); ctx.stroke();
    return base(a, { ink: "#0f172a", muted: "#475569", titleFont: SERIF, titleWeight: "700", titleTracking: 12, nameFont: SERIF, nameWeight: "600", nameSize: 150, bodyFont: GARAMOND, labelFont: MONO });
  },
};

// Portrait-safe but distinct palette variants of the strongest looks — each with its own composition tweak.
const variants: typeof RENDERERS = {
  ivory(ctx, a) {
    fill(ctx, "#fffff4"); frame(ctx, 90, a, 1.5); frame(ctx, 110, a, 6); frame(ctx, 130, a, 1.5);
    circle(ctx, W / 2, 110, 22, a); circle(ctx, W / 2, H - 110, 22, a); circle(ctx, 110, H / 2, 22, a); circle(ctx, W - 110, H / 2, 22, a);
    return base(a, { ink: "#1c1917", muted: "#57534e", titleFont: GARAMOND, titleWeight: "700", titleTracking: 20, nameFont: GARAMOND, nameWeight: "600", nameSize: 170, bodyFont: GARAMOND, labelFont: LIBRE });
  },
  sunrise(ctx, a) {
    lin(ctx, ["#fff7ed", "#ffedd5", "#fecdd3"], 0, 0, 0, H);
    circle(ctx, W / 2, H + 200, 700, rgba("#fb923c", 0.3)); circle(ctx, W / 2, H + 200, 520, rgba("#f97316", 0.3));
    for (let i = 0; i < 4; i++) wave(ctx, H - 120 + i * 30, 16, 120 + i * 30, rgba("#9a3412", 0.12 + i * 0.05));
    return base(a, { ink: "#431407", muted: "#9a3412", titleFont: MONT, titleWeight: "800", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONT, top: 250 });
  },
  ocean(ctx, a) {
    lin(ctx, ["#ecfeff", "#cffafe"], 0, 0, 0, H);
    for (let i = 0; i < 5; i++) wave(ctx, H - 330 + i * 60, 30 - i * 3, 150 + i * 40, rgba(mix("#0891b2", "#082f49", i / 5), 0.25 + i * 0.1));
    return base(a, { ink: "#083344", muted: "#155e75", titleFont: MONT, titleWeight: "800", titleTracking: 16, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONT, top: 230 });
  },
  forest(ctx, a) {
    lin(ctx, ["#f0fdf4", "#dcfce7"], 0, 0, 0, H);
    const r = rand(51); for (let layer = 0; layer < 3; layer++) for (let x = -60; x < W + 60; x += 90 + r() * 60) { const h = 200 + r() * 180 - layer * 50; poly(ctx, [[x, H - h], [x + 70, H], [x - 70, H]], rgba(mix("#166534", "#052e16", layer / 3), 0.25 + layer * 0.2)); }
    return base(a, { ink: "#052e16", muted: "#166534", titleFont: SERIF, titleWeight: "700", titleTracking: 12, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, labelFont: MONT, top: 240 });
  },
  mountain(ctx, a) {
    lin(ctx, ["#eef2ff", "#e0e7ff"], 0, 0, 0, H);
    poly(ctx, [[0, H], [0, H - 250], [400, H - 520], [800, H - 280], [1200, H - 600], [1700, H - 260], [2100, H - 480], [W, H - 300], [W, H]], rgba("#4338ca", 0.18));
    poly(ctx, [[0, H], [0, H - 150], [600, H - 350], [1100, H - 180], [1600, H - 380], [W, H - 160], [W, H]], rgba("#312e81", 0.28));
    circle(ctx, W - 380, 280, 90, rgba("#f59e0b", 0.5));
    return base(a, { ink: "#1e1b4b", muted: "#4338ca", titleFont: MONT, titleWeight: "800", titleTracking: 16, nameFont: SERIF, nameWeight: "600", nameSize: 150, labelFont: MONT, top: 240 });
  },
  confettiDark(ctx, a) {
    fill(ctx, "#111827"); const r = rand(61); const cols = ["#f43f5e", "#fbbf24", "#34d399", "#60a5fa", "#c084fc"];
    for (let i = 0; i < 220; i++) { const x = r() * W, y = r() * H; if (Math.abs(x - W / 2) < 950 && Math.abs(y - H / 2) < 600) continue; ctx.save(); ctx.translate(x, y); ctx.rotate(r() * TAU); ctx.fillStyle = cols[i % 5]!; ctx.fillRect(-12, -5, 24, 10); ctx.restore(); }
    return base("#fbbf24", { ...DARK, titleFont: MONT, titleWeight: "800", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, labelFont: MONT });
  },
};

Object.assign(RENDERERS, more, variants);
TEMPLATE_LIST.push(
  { id: "heraldic", name: "Heraldic Shield", group: "Classic", accent: "#7f1d1d" },
  { id: "victorian", name: "Victorian", group: "Classic", accent: "#78350f" },
  { id: "copperplate", name: "Copperplate", group: "Classic", accent: "#1e3a8a" },
  { id: "engraved", name: "Engraved Bond", group: "Classic", accent: "#115e59" },
  { id: "oxford", name: "Oxford Band", group: "Classic", accent: "#1e1b4b" },
  { id: "scroll", name: "Royal Scroll", group: "Classic", accent: "#7c2d12" },
  { id: "filigree", name: "Filigree", group: "Classic", accent: "#9f1239" },
  { id: "ivory", name: "Ivory Formal", group: "Classic", accent: "#44403c" },
  { id: "bauhaus", name: "Bauhaus", group: "Modern", accent: "#1d3557" },
  { id: "memphis", name: "Memphis Pop", group: "Modern", accent: "#6366f1" },
  { id: "duotone", name: "Duotone", group: "Modern", accent: "#2563eb" },
  { id: "pastelwave", name: "Pastel Waves", group: "Modern", accent: "#a855f7" },
  { id: "monoline", name: "Monoline", group: "Modern", accent: "#dc2626" },
  { id: "brutalist", name: "Brutalist", group: "Modern", accent: "#facc15" },
  { id: "editorial", name: "Editorial", group: "Modern", accent: "#b91c1c" },
  { id: "sidebar", name: "Gradient Sidebar", group: "Modern", accent: "#0f766e" },
  { id: "diagonal", name: "Diagonal Cut", group: "Modern", accent: "#0369a1" },
  { id: "arcs", name: "Concentric Arcs", group: "Modern", accent: "#ea580c" },
  { id: "sunrise", name: "Sunrise", group: "Modern", accent: "#ea580c" },
  { id: "ocean", name: "Ocean Waves", group: "Modern", accent: "#0891b2" },
  { id: "forest", name: "Pine Forest", group: "Modern", accent: "#15803d" },
  { id: "mountain", name: "Summit", group: "Modern", accent: "#4f46e5" },
  { id: "matrix", name: "Matrix Rain", group: "Tech", accent: "#22c55e" },
  { id: "terminal", name: "Terminal", group: "Tech", accent: "#3fb950" },
  { id: "circuitgrid", name: "Circuit Grid", group: "Tech", accent: "#38bdf8" },
  { id: "cyberpunk", name: "Cyberpunk", group: "Tech", accent: "#f0abfc" },
  { id: "datagrid", name: "Data Chart", group: "Tech", accent: "#2563eb" },
  { id: "isometric", name: "Isometric", group: "Tech", accent: "#7c3aed" },
  { id: "wireframe", name: "Wireframe Horizon", group: "Tech", accent: "#e879f9" },
  { id: "pixel", name: "Pixel Arcade", group: "Tech", accent: "#a78bfa" },
  { id: "baroque", name: "Baroque Noir", group: "Premium", accent: "#d6b36a" },
  { id: "rosegold", name: "Rose Gold", group: "Premium", accent: "#b76e79" },
  { id: "platinum", name: "Platinum", group: "Premium", accent: "#374151" },
  { id: "sapphire", name: "Sapphire", group: "Premium", accent: "#e8c77a" },
  { id: "velvet", name: "Velvet Curtain", group: "Premium", accent: "#9f1239" },
  { id: "obsidian", name: "Obsidian", group: "Premium", accent: "#a78bfa" },
  { id: "champagne", name: "Champagne", group: "Premium", accent: "#a47a2c" },
  { id: "emeraldlux", name: "Emerald Luxe", group: "Premium", accent: "#d4af37" },
  { id: "bronze", name: "Bronze Laurel", group: "Premium", accent: "#8a5428" },
  { id: "diwali", name: "Diwali Diyas", group: "Festive", accent: "#fbbf24" },
  { id: "holi", name: "Holi Colours", group: "Festive", accent: "#db2777" },
  { id: "christmas", name: "Christmas", group: "Festive", accent: "#b91c1c" },
  { id: "newyear", name: "New Year Fireworks", group: "Festive", accent: "#fbbf24" },
  { id: "balloons", name: "Balloons", group: "Festive", accent: "#db2777" },
  { id: "floral", name: "Floral Corners", group: "Festive", accent: "#e11d48" },
  { id: "origami", name: "Origami", group: "Festive", accent: "#0d9488" },
  { id: "sunburst", name: "Sunburst", group: "Festive", accent: "#d97706" },
  { id: "confettiDark", name: "Confetti Night", group: "Festive", accent: "#fbbf24" },
  { id: "track", name: "Running Track", group: "Sports", accent: "#c2410c" },
  { id: "football", name: "Football Pitch", group: "Sports", accent: "#facc15" },
  { id: "basketball", name: "Basketball Court", group: "Sports", accent: "#c2410c" },
  { id: "chess", name: "Chess Board", group: "Sports", accent: "#1c1917" },
  { id: "codecamp", name: "Code Camp", group: "Course", accent: "#6366f1" },
  { id: "science", name: "Science Lab", group: "Course", accent: "#0284c7" },
  { id: "library", name: "Library Shelf", group: "Course", accent: "#9a3412" },
  { id: "math", name: "Math Notebook", group: "Course", accent: "#1d4ed8" },
);
