// Portable certificate renderer. Uses only the standard Canvas 2D API, so the
// same code runs in the browser and in node-canvas (Synapse backend).
export const W = 2480;
export const H = 1754;

export type Signature = { name: string; role: string };
export type Img = CanvasImageSource & { width: number; height: number };

export type CertConfig = {
  template: string;
  badge: string; // short seal label e.g. "1ST", "WINNER"
  title: string;
  subtitle: string;
  name: string;
  description: string;
  eventTitle: string;
  eventDate: string;
  organizer: string;
  signatures: Signature[];
  certId: string;
  accent: string;
  showSeal: boolean;
  showId: boolean;
  orgLogos: Img[];
  sponsorLogos: Img[];
};

type Ctx = CanvasRenderingContext2D;

export type Theme = {
  align: "center" | "left";
  ink: string;
  muted: string;
  accent: string;
  titleFont: string; // family
  titleWeight: string;
  titleTracking: number;
  nameFont: string;
  nameWeight: string;
  nameSize: number;
  bodyFont: string;
  labelFont: string;
  eventColor: string;
  ruleColor: string;
  sealInk: string;
  top: number;
  left: number;
};

export const SERIF = "'Playfair Display', Georgia, serif";
export const GARAMOND = "'Cormorant Garamond', Georgia, serif";
export const CINZEL = "'Cinzel', Georgia, serif";
export const SCRIPT = "'Great Vibes', cursive";
export const GROTESK = "'Space Grotesk', Arial, sans-serif";
export const MANROPE = "'Manrope', Arial, sans-serif";
export const MONO = "'JetBrains Mono', monospace";

export const TEMPLATES: { id: string; name: string; defaultAccent: string; vibe: string }[] = [
  { id: "aurora", name: "Aurora", defaultAccent: "#6d5dfc", vibe: "Soft gradients, glass card" },
  { id: "luxe", name: "Noir Luxe", defaultAccent: "#d4a843", vibe: "Black and gold, script name" },
  { id: "academic", name: "Academic", defaultAccent: "#7f1d1d", vibe: "Classic double frame" },
  { id: "hackathon", name: "Terminal", defaultAccent: "#22d3ee", vibe: "Dark grid, neon, code" },
  { id: "swiss", name: "Swiss", defaultAccent: "#ef4444", vibe: "Bold type, clean grid" },
  { id: "geometric", name: "Geometric", defaultAccent: "#f59e0b", vibe: "Color blocks, angles" },
  { id: "ribbon", name: "Ribbon", defaultAccent: "#0f766e", vibe: "Corner sash, rosette seal" },
  { id: "modern", name: "Modern", defaultAccent: "#2563eb", vibe: "Clean corporate band" },
  { id: "botanical", name: "Botanical", defaultAccent: "#4d7c0f", vibe: "Leafy arcs, warm paper" },
  { id: "sunset", name: "Sunset", defaultAccent: "#e11d48", vibe: "Warm wave, festival feel" },
];

// ---------- helpers ----------
export function hexToRgb(hex: string) {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}
export function rgba(hex: string, a: number) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}
export function mix(hex: string, other: string, t: number) {
  const a = hexToRgb(hex), b = hexToRgb(other);
  const c = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${c(a.r, b.r)}${c(a.g, b.g)}${c(a.b, b.b)}`;
}

export function text(ctx: Ctx, s: string, x: number, y: number, font: string, fill: string, align: CanvasTextAlign, maxW?: number, tracking = 0) {
  ctx.font = font;
  ctx.fillStyle = fill;
  ctx.textAlign = align;
  ctx.textBaseline = "middle";
  if ("letterSpacing" in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = `${tracking}px`;
  if (maxW) {
    // shrink to fit
    let size = parseInt(font.match(/(\d+)px/)?.[1] || "40", 10);
    while (ctx.measureText(s).width > maxW && size > 18) {
      size -= 4;
      ctx.font = font.replace(/\d+px/, `${size}px`);
    }
  }
  ctx.fillText(s, x, y);
  if ("letterSpacing" in ctx) (ctx as Ctx & { letterSpacing: string }).letterSpacing = "0px";
}

export function fitImage(img: Img, maxW: number, maxH: number) {
  const r = img.width / img.height;
  let w = maxW, h = maxW / r;
  if (h > maxH) { h = maxH; w = maxH * r; }
  return { w, h };
}

export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function drawSeal(ctx: Ctx, cx: number, cy: number, r: number, color: string, label: string, ink: string) {
  ctx.save();
  // rosette
  ctx.fillStyle = color;
  ctx.beginPath();
  const spikes = 28;
  for (let i = 0; i <= spikes * 2; i++) {
    const a = (Math.PI * i) / spikes;
    const rr = i % 2 === 0 ? r : r * 0.9;
    ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.fill();
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r);
  g.addColorStop(0, rgba("#ffffff", 0.35));
  g.addColorStop(1, rgba("#000000", 0.12));
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = rgba(ink, 0.6);
  ctx.lineWidth = 4;
  ctx.setLineDash([6, 8]);
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2); ctx.stroke();
  ctx.setLineDash([]);
  // star
  ctx.fillStyle = ink;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (Math.PI * i) / 5;
    const rr = i % 2 === 0 ? r * 0.2 : r * 0.08;
    ctx.lineTo(cx + Math.cos(a) * rr, cy - r * 0.22 + Math.sin(a) * rr);
  }
  ctx.fill();
  text(ctx, label.toUpperCase(), cx, cy + r * 0.2, `800 ${Math.round(r * (label.length > 6 ? 0.2 : 0.28))}px ${MANROPE}`, ink, "center", r * 1.2, 4);
  ctx.restore();
}

// ---------- shared content layout ----------
function drawContent(ctx: Ctx, c: CertConfig, t: Theme) {
  const center = t.align === "center";
  const x = center ? W / 2 : t.left;
  const al: CanvasTextAlign = center ? "center" : "left";
  const maxW = center ? W - 700 : W - t.left - 520;
  let y = t.top;
  const sealR = 130;
  const headW = center && c.showSeal ? 2 * (W - 300 - sealR - 40 - W / 2) : maxW;

  // organizer logos
  const logos = c.orgLogos.filter(Boolean);
  if (logos.length) {
    const gap = 60;
    const sizes = logos.map((l) => fitImage(l, 260, 150));
    const total = sizes.reduce((s, z) => s + z.w, 0) + gap * (logos.length - 1);
    let lx = center ? W / 2 - total / 2 : t.left;
    logos.forEach((l, i) => {
      ctx.drawImage(l, lx, y - sizes[i]!.h / 2, sizes[i]!.w, sizes[i]!.h);
      lx += sizes[i]!.w + gap;
    });
    y += 170;
  } else if (c.organizer) {
    text(ctx, c.organizer.toUpperCase(), x, y, `600 34px ${t.labelFont}`, t.muted, al, headW, 10);
    y += 110;
  }

  text(ctx, c.title.toUpperCase(), x, y, `${t.titleWeight} 86px ${t.titleFont}`, t.ink, al, logos.length ? maxW : headW, t.titleTracking);
  y += 130;
  text(ctx, c.subtitle, x, y, `400 42px ${t.bodyFont}`, t.muted, al, maxW);
  y += 190;
  text(ctx, c.name || "Recipient Name", x, y, `${t.nameWeight} ${t.nameSize}px ${t.nameFont}`, t.ink, al, maxW);
  y += 140;
  ctx.fillStyle = t.ruleColor;
  if (center) ctx.fillRect(W / 2 - 360, y, 720, 4);
  else ctx.fillRect(t.left, y, 520, 6);
  y += 100;
  text(ctx, c.description, x, y, `400 42px ${t.bodyFont}`, t.muted, al, maxW);
  y += 95;
  text(ctx, c.eventTitle, x, y, `700 64px ${t.titleFont}`, t.eventColor, al, maxW);
  y += 85;
  if (c.eventDate) text(ctx, c.eventDate.toUpperCase(), x, y, `600 30px ${t.labelFont}`, t.muted, al, maxW, 8);

  // signatures
  const sigs = c.signatures.filter((s) => s.name.trim());
  const sigY = H - 330;
  if (sigs.length) {
    const area = center ? W * 0.72 : W - t.left - 560;
    const sx = center ? (W - area) / 2 : t.left;
    const step = area / sigs.length;
    sigs.forEach((s, i) => {
      const cx = center ? sx + step * i + step / 2 : sx + step * i + Math.min(step, 520) / 2;
      text(ctx, s.name, cx, sigY - 50, `400 70px ${SCRIPT}`, rgba(t.ink, 0.85), "center", Math.min(step - 40, 460));
      ctx.fillStyle = rgba(t.ink, 0.7);
      ctx.fillRect(cx - 190, sigY, 380, 3);
      text(ctx, s.name.toUpperCase(), cx, sigY + 45, `700 28px ${t.labelFont}`, t.ink, "center", Math.min(step - 40, 420), 3);
      text(ctx, s.role.toUpperCase(), cx, sigY + 90, `500 22px ${t.labelFont}`, t.muted, "center", Math.min(step - 40, 420), 4);
    });
  }

  // sponsors
  const sp = c.sponsorLogos.filter(Boolean);
  if (sp.length) {
    const baseY = H - 150;
    text(ctx, "SUPPORTED BY", W / 2, baseY - 40, `600 20px ${t.labelFont}`, t.muted, "center", undefined, 8);
    const sizes = sp.map((l) => fitImage(l, 200, 80));
    const gap = 70;
    const total = sizes.reduce((s, z) => s + z.w, 0) + gap * (sp.length - 1);
    let lx = W / 2 - total / 2;
    sp.forEach((l, i) => {
      ctx.drawImage(l, lx, baseY + 10 + (80 - sizes[i]!.h) / 2, sizes[i]!.w, sizes[i]!.h);
      lx += sizes[i]!.w + gap;
    });
  }

  if (c.showSeal) {
    if (center) drawSeal(ctx, W - 300, 300, sealR, t.accent, c.badge || "★", t.sealInk);
    else drawSeal(ctx, W - 420, H / 2 - 80, 170, t.accent, c.badge || "★", t.sealInk);
  }
  if (c.showId && c.certId) {
    text(ctx, `CERTIFICATE ID · ${c.certId}`, W / 2, 168, `500 22px ${MONO}`, t.muted, "center", undefined, 3);
  }
}

// ---------- templates ----------
export function base(accent: string, over: Partial<Theme> = {}): Theme {
  return {
    align: "center", ink: "#111827", muted: "#6b7280", accent,
    titleFont: MANROPE, titleWeight: "800", titleTracking: 18,
    nameFont: SERIF, nameWeight: "600", nameSize: 150,
    bodyFont: MANROPE, labelFont: MANROPE, eventColor: accent, ruleColor: accent,
    sealInk: "#ffffff", top: 280, left: 260, ...over,
  };
}

export const RENDERERS: Record<string, (ctx: Ctx, a: string) => Theme> = {
  aurora(ctx, a) {
    ctx.fillStyle = "#f7f6fb"; ctx.fillRect(0, 0, W, H);
    const blob = (x: number, y: number, r: number, col: string) => {
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(col, 0.55)); g.addColorStop(1, rgba(col, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    };
    blob(250, 200, 900, a); blob(W - 200, H - 150, 1000, mix(a, "#ff7ab6", 0.6)); blob(W - 300, 150, 700, mix(a, "#38bdf8", 0.6));
    ctx.fillStyle = "rgba(255,255,255,0.72)";
    roundRect(ctx, 110, 110, W - 220, H - 220, 60); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 4; ctx.stroke();
    return base(a, { ink: "#1e1b3a", muted: "#6b6889", nameFont: MANROPE, nameWeight: "800", nameSize: 140 });
  },
  luxe(ctx, a) {
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#0d0d0f"); g.addColorStop(1, "#1c1a17");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const gold = ctx.createLinearGradient(0, 0, W, 0);
    gold.addColorStop(0, mix(a, "#000000", 0.2)); gold.addColorStop(0.5, mix(a, "#ffffff", 0.45)); gold.addColorStop(1, mix(a, "#000000", 0.2));
    ctx.strokeStyle = gold; ctx.lineWidth = 10; ctx.strokeRect(80, 80, W - 160, H - 160);
    ctx.lineWidth = 2; ctx.strokeRect(115, 115, W - 230, H - 230);
    // corner diamonds
    ctx.fillStyle = gold;
    ([[115, 115], [W - 115, 115], [115, H - 115], [W - 115, H - 115]] as [number, number][]).forEach(([x, y]) => {
      ctx.beginPath(); ctx.moveTo(x, y - 30); ctx.lineTo(x + 30, y); ctx.lineTo(x, y + 30); ctx.lineTo(x - 30, y); ctx.fill();
    });
    return base(a, { ink: "#f5efe0", muted: "#a8a08e", titleFont: GARAMOND, titleWeight: "700", titleTracking: 22, nameFont: SCRIPT, nameWeight: "400", nameSize: 210, bodyFont: GARAMOND, eventColor: mix(a, "#ffffff", 0.3), sealInk: "#1a1712" });
  },
  academic(ctx, a) {
    ctx.fillStyle = "#fbf7ee"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = a; ctx.lineWidth = 36; ctx.strokeRect(60, 60, W - 120, H - 120);
    ctx.strokeStyle = "#c9a646"; ctx.lineWidth = 4; ctx.strokeRect(115, 115, W - 230, H - 230);
    ctx.lineWidth = 2; ctx.strokeRect(135, 135, W - 270, H - 270);
    ctx.strokeStyle = "#c9a646"; ctx.lineWidth = 3;
    ([[135, 135, 1, 1], [W - 135, 135, -1, 1], [135, H - 135, 1, -1], [W - 135, H - 135, -1, -1]] as [number, number, number, number][]).forEach(([x, y, dx, dy]) => {
      for (let i = 1; i <= 3; i++) { ctx.beginPath(); ctx.arc(x, y, 40 * i, dx > 0 ? (dy > 0 ? 0 : -Math.PI / 2) : (dy > 0 ? Math.PI / 2 : Math.PI), dx > 0 ? (dy > 0 ? Math.PI / 2 : 0) : (dy > 0 ? Math.PI : Math.PI * 1.5)); ctx.stroke(); }
    });
    return base(a, { ink: "#2b1d12", muted: "#7a6a58", titleFont: CINZEL, titleWeight: "700", titleTracking: 14, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, ruleColor: "#c9a646", sealInk: "#fff7e6" });
  },
  hackathon(ctx, a) {
    ctx.fillStyle = "#070b14"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(a, 0.08); ctx.lineWidth = 2;
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const glow = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, 1400);
    glow.addColorStop(0, rgba(a, 0.25)); glow.addColorStop(1, rgba(a, 0));
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = a; ctx.lineWidth = 8;
    const L = 140, m = 90;
    ([[m, m, 1, 1], [W - m, m, -1, 1], [m, H - m, 1, -1], [W - m, H - m, -1, -1]] as [number, number, number, number][]).forEach(([x, y, dx, dy]) => {
      ctx.beginPath(); ctx.moveTo(x, y + L * dy); ctx.lineTo(x, y); ctx.lineTo(x + L * dx, y); ctx.stroke();
    });
    text(ctx, "> verified_build --status=passed", m + 40, m + 40, `400 26px ${MONO}`, rgba(a, 0.7), "left");
    return base(a, { ink: "#e6f1ff", muted: "#8aa0bd", titleFont: MONO, titleWeight: "700", titleTracking: 10, nameFont: GROTESK, nameWeight: "700", nameSize: 160, bodyFont: GROTESK, labelFont: MONO, sealInk: "#04121a" });
  },
  swiss(ctx, a) {
    ctx.fillStyle = "#f4f2ee"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(0, 0, 140, H);
    ctx.fillStyle = "#111111"; ctx.fillRect(140, 0, 12, H);
    ctx.fillStyle = rgba("#111111", 0.06);
    for (let i = 0; i < 12; i++) ctx.fillRect(260 + i * 180, 0, 1, H);
    return base(a, { align: "left", ink: "#111111", muted: "#5b5b5b", titleFont: GROTESK, titleWeight: "700", titleTracking: 6, nameFont: GROTESK, nameWeight: "700", nameSize: 180, bodyFont: GROTESK, labelFont: GROTESK, eventColor: "#111111", left: 300, top: 260 });
  },
  geometric(ctx, a) {
    ctx.fillStyle = "#fffdf7"; ctx.fillRect(0, 0, W, H);
    const tri = (pts: [number, number][], col: string) => { ctx.fillStyle = col; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.fill(); };
    tri([[W, 0], [W, 900], [W - 700, 0]], a);
    tri([[W, 0], [W, 520], [W - 1100, 0]], rgba("#111827", 0.9));
    tri([[0, H], [0, H - 600], [800, H]], mix(a, "#ffffff", 0.35));
    tri([[0, H], [0, H - 300], [450, H]], "#111827");
    ctx.fillStyle = a; ctx.beginPath(); ctx.arc(W - 520, H - 260, 70, 0, Math.PI * 2); ctx.fill();
    return base(a, { align: "left", titleFont: GROTESK, titleWeight: "700", nameFont: MANROPE, nameWeight: "800", nameSize: 165, left: 240, top: 250, ruleColor: "#111827" });
  },
  ribbon(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = rgba(a, 0.25); ctx.lineWidth = 3; ctx.strokeRect(70, 70, W - 140, H - 140);
    ctx.save(); ctx.translate(0, 0); ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = a; ctx.fillRect(-500, 330, 1000, 110);
    ctx.fillStyle = mix(a, "#ffffff", 0.3); ctx.fillRect(-500, 460, 1000, 26);
    ctx.restore();
    ctx.save(); ctx.translate(W, H); ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = a; ctx.fillRect(-500, -440, 1000, 110);
    ctx.restore();
    return base(a, { titleFont: SERIF, titleWeight: "800", titleTracking: 10, nameFont: SERIF, nameWeight: "600", nameSize: 160, bodyFont: MANROPE });
  },
  modern(ctx, a) {
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = a; ctx.fillRect(0, 0, W, 36);
    ctx.fillStyle = rgba(a, 0.08); ctx.fillRect(0, H - 260, W, 260);
    ctx.fillStyle = a; ctx.fillRect(0, H - 260, W, 6);
    return base(a, { titleFont: MANROPE, nameFont: MANROPE, nameWeight: "800", nameSize: 150 });
  },
  botanical(ctx, a) {
    ctx.fillStyle = "#faf6ec"; ctx.fillRect(0, 0, W, H);
    const leaf = (x: number, y: number, s: number, rot: number, col: string) => {
      ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(s * 0.5, -s * 0.35, s, 0); ctx.quadraticCurveTo(s * 0.5, s * 0.35, 0, 0); ctx.fill(); ctx.restore();
    };
    const branch = (ox: number, oy: number, dir: number) => {
      ctx.strokeStyle = rgba(a, 0.7); ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(ox, oy, 420, dir === 1 ? 0 : Math.PI, dir === 1 ? Math.PI / 2 : Math.PI * 1.5); ctx.stroke();
      for (let i = 0; i < 9; i++) {
        const t = (i / 8) * (Math.PI / 2) + (dir === 1 ? 0 : Math.PI);
        const x = ox + Math.cos(t) * 420, y = oy + Math.sin(t) * 420;
        leaf(x, y, 110, t + 0.6, rgba(i % 2 ? a : mix(a, "#c2a24a", 0.5), 0.75));
        leaf(x, y, 90, t + 2.4, rgba(mix(a, "#ffffff", 0.3), 0.7));
      }
    };
    branch(-60, -60, 1); branch(W + 60, H + 60, -1);
    ctx.strokeStyle = rgba(a, 0.35); ctx.lineWidth = 3; ctx.strokeRect(100, 100, W - 200, H - 200);
    return base(a, { ink: "#27301c", muted: "#6f7560", titleFont: CINZEL, titleWeight: "500", titleTracking: 16, nameFont: SCRIPT, nameWeight: "400", nameSize: 200, bodyFont: GARAMOND, sealInk: "#fffbea" });
  },
  sunset(ctx, a) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#fff7ed"); g.addColorStop(1, "#ffe4e6");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const wave = (y: number, amp: number, col: string) => {
      ctx.fillStyle = col; ctx.beginPath(); ctx.moveTo(0, H);
      for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x / 260) * amp);
      ctx.lineTo(W, H); ctx.fill();
    };
    wave(H - 250, 40, rgba(mix(a, "#f59e0b", 0.5), 0.35));
    wave(H - 170, 30, rgba(a, 0.55));
    wave(H - 90, 22, a);
    ctx.fillStyle = rgba(mix(a, "#f59e0b", 0.6), 0.25);
    ctx.beginPath(); ctx.arc(W - 330, 330, 200, 0, Math.PI * 2); ctx.fill();
    return base(a, { ink: "#3b0a1a", muted: "#8a5a66", titleFont: SERIF, titleWeight: "800", titleTracking: 10, nameFont: SERIF, nameWeight: "600", nameSize: 155, top: 250 });
  },
};

export function renderCertificate(ctx: Ctx, c: CertConfig) {
  ctx.save();
  ctx.clearRect(0, 0, W, H);
  const r = RENDERERS[c.template] ?? RENDERERS["modern"]!;
  const theme = r(ctx, c.accent);
  drawContent(ctx, c, theme);
  ctx.restore();
}
